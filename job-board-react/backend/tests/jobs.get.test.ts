import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/db/client.js";
import { resetJobs } from "./testDb.js";

describe("GET /api/jobs", () => {
  beforeEach(resetJobs);
  afterEach(resetJobs);

  it("returns all jobs ordered by postedDate desc", async () => {
    const app = buildApp();

    const older = await prisma.job.create({
      data: {
        title: "Older Job",
        company: "Acme",
        location: "Remote",
        description: "desc",
        employmentType: "FullTime",
        locationType: "Remote",
        applicationUrl: "https://example.com/apply",
        postedDate: new Date("2026-01-01T00:00:00.000Z"),
      },
    });
    const newer = await prisma.job.create({
      data: {
        title: "Newer Job",
        company: "Acme",
        location: "Remote",
        description: "desc",
        employmentType: "Contract",
        locationType: "Onsite",
        applicationUrl: "https://example.com/apply2",
        postedDate: new Date("2026-02-01T00:00:00.000Z"),
      },
    });

    const response = await app.inject({ method: "GET", url: "/api/jobs" });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.map((job: { id: number }) => job.id)).toEqual([newer.id, older.id]);
  });
});
