import type { CreateJobInput, Job } from "../types";

export async function getJobs(): Promise<Job[]> {
  const response = await fetch("/api/jobs");
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs (${response.status})`);
  }
  return response.json();
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Failed to create job (${response.status})`);
  }
  return response.json();
}

export async function deleteJob(id: number): Promise<void> {
  const response = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`Failed to delete job (${response.status})`);
  }
}
