import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createJob, deleteJob, getJobs } from "./client";
import type { CreateJobInput, Job } from "../types";

describe("api/client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getJobs fetches from GET /api/jobs and returns parsed jobs", async () => {
    const jobs: Job[] = [
      {
        id: 1,
        title: "Engineer",
        company: "Acme",
        location: "Remote",
        description: "desc",
        employmentType: "FullTime",
        locationType: "Remote",
        applicationUrl: "https://example.com",
        postedDate: "2026-01-01T00:00:00.000Z",
      },
    ];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => jobs,
    });

    const result = await getJobs();

    expect(fetch).toHaveBeenCalledWith("/api/jobs");
    expect(result).toEqual(jobs);
  });

  it("createJob posts to POST /api/jobs with a JSON body", async () => {
    const input: CreateJobInput = {
      title: "Engineer",
      company: "Acme",
      location: "Remote",
      description: "desc",
      employmentType: "FullTime",
      locationType: "Remote",
      applicationUrl: "https://example.com",
    };
    const created: Job = { ...input, id: 1, postedDate: "2026-01-01T00:00:00.000Z" };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => created,
    });

    const result = await createJob(input);

    expect(fetch).toHaveBeenCalledWith("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    expect(result).toEqual(created);
  });

  it("deleteJob sends a DELETE request to /api/jobs/:id", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    await deleteJob(1);

    expect(fetch).toHaveBeenCalledWith("/api/jobs/1", { method: "DELETE" });
  });
});
