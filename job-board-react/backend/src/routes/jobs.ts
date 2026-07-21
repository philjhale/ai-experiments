import type { FastifyInstance, FastifyReply } from "fastify";
import { prisma } from "../db/client.js";
import { createJobSchema } from "../validation/job.js";

export async function jobsRoutes(app: FastifyInstance) {
  app.get("/api/jobs", async () => {
    return prisma.job.findMany({ orderBy: { postedDate: "desc" } });
  });

  app.post("/api/jobs", async (request, reply: FastifyReply) => {
    const parsed = createJobSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ errors: parsed.error.flatten() });
    }

    const job = await prisma.job.create({ data: parsed.data });
    return reply.status(201).send(job);
  });
}
