import Fastify from "fastify";
import { jobsRoutes } from "./routes/jobs.js";

export function buildApp() {
  const app = Fastify({ logger: false });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(jobsRoutes);

  return app;
}
