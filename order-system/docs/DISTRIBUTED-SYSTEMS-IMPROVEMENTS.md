# Ideas: Demonstrating Distributed Systems Practices

Candidate improvements to the order-processing demo, beyond the MVP in `SPEC.md`, that would better demonstrate distributed-systems patterns and failure modes. Not yet scoped into any stage — capture here for later triage.

## High value, still small (candidates for the MVP itself)
- **Idempotency** — dedupe on `OrderCreated` message ID so a Service Bus redelivery doesn't double-reserve inventory. The most common gotcha in pub/sub systems; cheap to implement.
- **Poison message handling demo** — deliberately publish one malformed message and show it land in the dead-letter queue instead of crashing the worker. Service Bus does the mechanics for free; the work is surfacing it (e.g. in `GET /orders/{id}` or logs) so it's visible rather than silent.

## Observability
- **Structured logging** — consistent JSON logs with correlation ID, order ID, and status transition on every write, across all three services. Cheap, and it's what makes the fan-out demo actually inspectable in `func` output or App Insights.
- **Correlation ID / distributed tracing** — pass a trace ID through HTTP → Table Storage → Service Bus → both workers, logged consistently (or wired into Application Insights). Makes the fan-out actually visible instead of inferred from timing.
- **Application Insights + custom metrics** — Azure Functions wire into App Insights near-for-free; add custom metrics like `orders.created`, `orders.reserved`, `orders.failed`, and Service Bus queue depth. Turns the demo into something you can screenshot as a dashboard, a stronger artifact than logs alone.
- **End-to-end latency tracking** — timestamp each status transition (`CreatedAt`, `ReservedAt`, `NotifiedAt` on the `Order` record) so you can compute and show time-to-completion per order, and spot a slow/stuck worker.
- **Health/liveness signals** — Service Bus subscription message-count and dead-letter-count as a simple health check, so you can demonstrate noticing a stuck consumer rather than just trusting it works.

Biggest lift of this group is App Insights + custom metrics (needs a Terraform resource + SDK wiring), but it's also the one that visually sells "observability" — logs alone tend to read as debugging output, not observability. Structured logging, correlation ID, and status timestamps are nearly free and are good MVP candidates.

## Medium value, moderate scope increase
- **Outbox pattern** — instead of "write to Table Storage, then publish" (which can fail between the two steps and leave state inconsistent), write the event to an outbox row in the same table transaction and have a separate dispatcher publish it. The canonical fix for the dual-write problem.
- **Saga / compensation on failure** — if the Inventory Worker "fails" (simulate via injected random error), transition the order to a `Failed` or `Cancelled` state rather than leaving it stuck in `Created` forever. Right now failures are invisible.
- **Load/concurrency test** — POST many orders concurrently and confirm both subscriptions process independently without cross-contamination (e.g. PartitionKey collisions). Demonstrates that fan-out scales per-consumer.

## Lower priority / likely out of scope
- Circuit breakers, retries with backoff beyond Service Bus defaults, multi-region, CQRS/event sourcing. Real patterns, but risk turning a "practice async messaging" demo into a much larger system — works against the project's stated scope in `SPEC.md`.

## Suggested next step
Fold "idempotency," "visible dead-letter handling," and the near-free observability items (structured logging, correlation ID, status timestamps) into the MVP. Treat "outbox pattern," "saga/failure compensation," and App Insights + custom metrics as an explicit "Stage 3: Resilience & Observability" addendum to `SPEC.md` if/when there's appetite to build them, rather than baking them into Stage 1/2.
