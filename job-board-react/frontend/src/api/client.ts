import type { CreateJobInput, Job } from "../types";

export async function getJobs(): Promise<Job[]> {
  const response = await fetch("/api/jobs");
  return response.json();
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return response.json();
}

export async function deleteJob(id: number): Promise<void> {
  await fetch(`/api/jobs/${id}`, { method: "DELETE" });
}
