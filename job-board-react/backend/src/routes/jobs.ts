import type { FastifyInstance, FastifyReply } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/client.js";
import { createJobSchema, jobIdParamSchema } from "../validation/job.js";

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

  app.delete<{ Params: { id: string } }>("/api/jobs/:id", async (request, reply: FastifyReply) => {
    const parsedParams = jobIdParamSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({ errors: parsedParams.error.flatten() });
    }

    try {
      await prisma.job.delete({ where: { id: parsedParams.data.id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return reply.status(404).send({ error: "Job not found" });
      }
      throw err;
    }

    return reply.status(204).send();
  });
}
