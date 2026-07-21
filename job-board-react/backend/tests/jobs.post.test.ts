import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/db/client.js";
import { resetJobs } from "./testDb.js";

const validPayload = {
  title: "Software Engineer",
  company: "Acme",
  location: "Remote",
  description: "Build things",
  employmentType: "FullTime",
  locationType: "Remote",
  applicationUrl: "https://example.com/apply",
};

describe("POST /api/jobs", () => {
  beforeEach(resetJobs);
  afterEach(resetJobs);

  it("creates a job and returns it with 201", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/jobs",
      payload: validPayload,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body).toMatchObject(validPayload);
    expect(body.id).toBeTypeOf("number");

    const stored = await prisma.job.findUnique({ where: { id: body.id } });
    expect(stored).not.toBeNull();
  });

  it("rejects a payload with a malformed applicationUrl", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/jobs",
      payload: { ...validPayload, applicationUrl: "not-a-url" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects a payload missing a required field", async () => {
    const app = buildApp();
    const { title, ...rest } = validPayload;

    const response = await app.inject({
      method: "POST",
      url: "/api/jobs",
      payload: rest,
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects a payload with an invalid employmentType enum value", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/jobs",
      payload: { ...validPayload, employmentType: "Freelance" },
    });

    expect(response.statusCode).toBe(400);
  });

  it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>"])(
    "rejects an applicationUrl with a disallowed scheme (%s)",
    async (applicationUrl) => {
      const app = buildApp();

      const response = await app.inject({
        method: "POST",
        url: "/api/jobs",
        payload: { ...validPayload, applicationUrl },
      });

      expect(response.statusCode).toBe(400);
    },
  );
});
