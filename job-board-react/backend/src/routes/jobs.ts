import type { FastifyInstance } from "fastify";
import { prisma } from "../db/client.js";

export async function jobsRoutes(app: FastifyInstance) {
  app.get("/api/jobs", async () => {
    return prisma.job.findMany({ orderBy: { postedDate: "desc" } });
  });
}
