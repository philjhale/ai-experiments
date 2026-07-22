# Spec: Distributed Order Processing Demo

## Objective
A minimal but real distributed system on Azure to practice async messaging patterns (pub/sub fan-out, eventual consistency, independent consumers), using Terraform for infra and C# (Azure Functions) for services. This is a learning/demo project, not a production system.

**Success looks like:** a client POSTs an order, the order is persisted, an event fans out to two independent workers that each update/react to it on their own schedule, and the client can poll and watch the order's status progress to completion.

**Out of scope:** real email/SMS delivery, payment processing, authentication, custom resilience beyond what Service Bus/Functions give for free (retries, dead-lettering), multi-environment infra (staging/prod split).

## Tech Stack
- C# / .NET, Azure Functions (isolated worker model)
- Azure Table Storage (order records)
- Azure Service Bus (topic + subscriptions, pub/sub fan-out)
- Terraform (local state) for infra provisioning
- Local dev: Azurite (Storage emulator) + Service Bus emulator, so the flow can be exercised without a live Azure subscription
- xUnit for unit tests

## Architecture
```
Client ──HTTP──> Order API (Azure Function, HTTP trigger)
                     │
                     ├─ writes order record ──> Azure Table Storage
                     │
                     └─ publishes "OrderCreated" event ──> Service Bus Topic
                                                              │
                                        ┌─────────────────────┴─────────────────────┐
                                        │                                           │
                              Subscription: inventory                    Subscription: notification
                                        │                                           │
                             Inventory Worker (Function,                Notification Worker (Function,
                             Service Bus trigger)                       Service Bus trigger)
                                        │                                           │
                             updates order status in                    logs/simulates a
                             Table Storage                               notification (e.g. writes
                                                                          to console/App Insights)
```

**Components:**
1. **Order API** — HTTP-triggered Function. `POST /orders` validates input, writes a row to Table Storage (`status: Created`), publishes an `OrderCreated` message to the `order-events` Service Bus topic. `GET /orders/{id}` returns current status.
2. **Service Bus topic** `order-events` with two subscriptions — `inventory-sub` and `notification-sub` — each downstream worker gets its own copy of every message (pub/sub fan-out).
3. **Inventory Worker** — Service Bus-triggered Function on `inventory-sub`. Simulates a stock check/reservation, updates order status to `InventoryReserved`.
4. **Notification Worker** — Service Bus-triggered Function on `notification-sub`. Simulates sending a notification (logs it only, no real email/SMS).
5. **Table Storage** — one table holding order records (PartitionKey/RowKey, status, timestamps).

**Data flow:** order created → row written (`Created`) → event published → both workers receive their own copy concurrently → Inventory Worker updates status → Notification Worker logs a message. Client can poll `GET /orders/{id}` to watch status change.

**Error handling / resilience:** kept intentionally light since messaging is the focus, not full resilience. Service Bus's built-in retry + dead-letter queue (default Function binding behavior) is enough to observe the pattern — no custom circuit breakers or saga compensation needed for this scope.

## Commands
```
Build:                 dotnet build
Test:                  dotnet test
Run a Function app locally: func start   (run from each service's project directory)
Start local storage emulator: azurite
Terraform init:         terraform init   (run from infra/)
Terraform plan:         terraform plan
Terraform apply:        terraform apply
Terraform destroy:      terraform destroy
```

## Project Structure
```
order-system/
  docs/
    changes/             → one file per spec change, newest first (see Change History)
  infra/                 → Terraform config: Resource Group, Storage Account, Service Bus
                            namespace/topic/subscriptions, 3 Function Apps
  src/
    OrderApi/             → HTTP-triggered Function app (POST /orders, GET /orders/{id})
    InventoryWorker/       → Service Bus-triggered Function app (inventory-sub)
    NotificationWorker/    → Service Bus-triggered Function app (notification-sub)
    OrderSystem.Shared/    → shared models (Order, OrderStatus, OrderCreatedEvent) used by all three
  tests/
    OrderSystem.Tests/     → xUnit unit tests, mirrors src/ structure
  SPEC.md
```

## Data Model
```csharp
public class Order
{
    public string PartitionKey { get; set; } = "order";
    public string RowKey { get; set; } = Guid.NewGuid().ToString();
    public OrderStatus Status { get; set; } = OrderStatus.Created;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; set; }
    // order contents (items, quantities, etc.) to be defined when Order API is built
}

public enum OrderStatus { Created, InventoryReserved, NotificationSent }
```
The exact order "contents" fields (items/quantities/customer info) are deliberately left open — this is a messaging-pattern demo, not a real order schema. Define them minimally when implementing the Order API task, and update this section.

## Code Style
- Standard C# conventions: PascalCase for public members/types, camelCase for locals/params, `_camelCase` for private fields.
- Nullable reference types enabled.
- Isolated worker model for all three Function apps (not the in-process model).
- Shared types (`Order`, `OrderStatus`, event contracts) live in `OrderSystem.Shared`, referenced by all three Function projects — no duplicated model definitions.
- Table Storage and Service Bus access go through thin client wrappers, not scattered raw SDK calls in Function bodies, so they stay testable.

## Testing Strategy
- Framework: xUnit.
- Location: `tests/OrderSystem.Tests/`, mirroring `src/` structure.
- Unit tests cover: order validation logic, status-transition logic, and any pure business logic in the workers — using fakes/mocks for Table Storage and Service Bus, not live resources.
- Integration/end-to-end is manual and exploratory: use a `.http` file or curl to `POST /orders`, then poll `GET /orders/{id}` and watch status transition through Created → InventoryReserved (notification is fire-and-forget so it won't appear as a status field beyond that, unless we decide to add one), while checking local Function logs / Azurite / Service Bus emulator to confirm both subscriptions fired independently.
- No automated integration test suite required for this project's scope.

## Boundaries
- **Always do:** run `dotnet test` before considering a task complete; keep shared models in `OrderSystem.Shared`; keep infra changes in Terraform (no manual portal changes that aren't reflected in `infra/`); follow the project structure above.
- **Ask first:** provisioning real Azure resources (`terraform apply` against a live subscription — cost implications); adding new NuGet/Terraform provider dependencies; changing Terraform state configuration (e.g. moving off local state); expanding scope beyond what's in this spec.
- **Never do:** commit secrets, connection strings, or `local.settings.json` with real values; force-push; run `terraform apply`/`destroy` against a shared or production subscription; remove failing tests without approval.

## Success Criteria — Stage 1: Local
- [ ] `dotnet build` succeeds for all three Function apps and the shared project.
- [ ] `dotnet test` passes, covering order validation and status-transition logic.
- [ ] Running all three Function apps locally (against Azurite + Service Bus emulator), a `POST /orders` request creates a row in local Table Storage with status `Created`.
- [ ] Both `inventory-sub` and `notification-sub` receive their own copy of the `OrderCreated` message and fire independently (visible in logs).
- [ ] `GET /orders/{id}` shows status transitioning to `InventoryReserved` after the Inventory Worker processes its message.
- [ ] Notification Worker logs a simulated notification for the same order.

## Success Criteria — Stage 2: Deployed to Azure
- [ ] `terraform apply` (against a personal/dev subscription, after explicit go-ahead) provisions Resource Group, Storage Account, Service Bus namespace/topic/subscriptions, and 3 Function Apps, wired together via Terraform outputs/app settings.
- [ ] The same end-to-end flow from Stage 1 is demonstrated against the deployed resources (real HTTP endpoint, real Table Storage, real Service Bus).
- [ ] `terraform destroy` cleanly tears down all provisioned resources when the demo is done (to avoid ongoing cost).

## Open Questions
- Exact `Order` content fields (items, customer info) — to be decided when the Order API task starts.
- Whether Stage 2 targets a specific existing Azure subscription/tenant, or a new one to be set up — needs confirming before any `terraform apply` against real infra.

## Change History
Rationale and scope for each change to this spec will be recorded in `docs/changes/`, one file per change, newest first. None yet — this is the initial spec.
