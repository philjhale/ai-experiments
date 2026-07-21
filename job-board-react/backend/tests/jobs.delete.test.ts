import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/db/client.js";
import { resetJobs } from "./testDb.js";

describe("DELETE /api/jobs/:id", () => {
  beforeEach(resetJobs);
  afterEach(resetJobs);

  it("deletes the job and removes it from subsequent list queries", async () => {
    const app = buildApp();
    const job = await prisma.job.create({
      data: {
        title: "To Delete",
        company: "Acme",
        location: "Remote",
        description: "desc",
        employmentType: "FullTime",
        locationType: "Remote",
        applicationUrl: "https://example.com/apply",
      },
    });

    const deleteResponse = await app.inject({ method: "DELETE", url: `/api/jobs/${job.id}` });
    expect(deleteResponse.statusCode).toBe(204);

    const listResponse = await app.inject({ method: "GET", url: "/api/jobs" });
    const body = listResponse.json();
    expect(body.find((j: { id: number }) => j.id === job.id)).toBeUndefined();
  });

  it("returns 404 when deleting a non-existent id", async () => {
    const app = buildApp();

    const response = await app.inject({ method: "DELETE", url: "/api/jobs/999999" });

    expect(response.statusCode).toBe(404);
  });
});
