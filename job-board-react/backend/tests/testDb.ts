import { prisma } from "../src/db/client.js";

export async function resetJobs() {
  await prisma.job.deleteMany();
}
