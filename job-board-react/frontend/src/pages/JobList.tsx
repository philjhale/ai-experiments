import { useEffect, useState } from "react";
import { deleteJob, getJobs } from "../api/client";
import type { Job } from "../types";

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load jobs. Please try again later."));
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this job posting?")) {
      return;
    }
    await deleteJob(id);
    setJobs((current) => current.filter((job) => job.id !== id));
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <ul>
      {jobs.map((job) => (
        <li key={job.id}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
          <p>{job.location}</p>
          <p>{job.employmentType}</p>
          <p>{job.locationType}</p>
          <p>{job.description}</p>
          <a href={job.applicationUrl} className="apply-link">
            Apply
          </a>
          <button type="button" className="delete-link" onClick={() => handleDelete(job.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
