# Ideas: Demonstrating Distributed Systems Practices

Candidate improvements to the order-processing demo, beyond the MVP in `SPEC.md`, that would better demonstrate distributed-systems patterns and failure modes. Not yet scoped into any stage — capture here for later triage.

## High value, still small (candidates for the MVP itself)
- **Idempotency** — dedupe on `OrderCreated` message ID so a Service Bus redelivery doesn't double-reserve inventory. The most common gotcha in pub/sub systems; cheap to implement.
- **Correlation ID / distributed tracing** — pass a trace ID through HTTP → Table Storage → Service Bus → both workers, logged consistently (or wired into Application Insights). Makes the fan-out actually visible instead of inferred from timing.
- **Poison message handling demo** — deliberately publish one malformed message and show it land in the dead-letter queue instead of crashing the worker. Service Bus does the mechanics for free; the work is surfacing it (e.g. in `GET /orders/{id}` or logs) so it's visible rather than silent.

## Medium value, moderate scope increase
- **Outbox pattern** — instead of "write to Table Storage, then publish" (which can fail between the two steps and leave state inconsistent), write the event to an outbox row in the same table transaction and have a separate dispatcher publish it. The canonical fix for the dual-write problem.
- **Saga / compensation on failure** — if the Inventory Worker "fails" (simulate via injected random error), transition the order to a `Failed` or `Cancelled` state rather than leaving it stuck in `Created` forever. Right now failures are invisible.
- **Load/concurrency test** — POST many orders concurrently and confirm both subscriptions process independently without cross-contamination (e.g. PartitionKey collisions). Demonstrates that fan-out scales per-consumer.

## Lower priority / likely out of scope
- Circuit breakers, retries with backoff beyond Service Bus defaults, multi-region, CQRS/event sourcing. Real patterns, but risk turning a "practice async messaging" demo into a much larger system — works against the project's stated scope in `SPEC.md`.

## Suggested next step
Fold "idempotency," "correlation ID / tracing," and "visible dead-letter handling" into the MVP (cheap, directly on-topic). Treat "outbox pattern" and "saga/failure compensation" as an explicit "Stage 3: Resilience" addendum to `SPEC.md` if/when there's appetite to build them, rather than baking them into Stage 1/2.
