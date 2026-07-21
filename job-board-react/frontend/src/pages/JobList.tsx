import { useEffect, useState } from "react";
import { deleteJob, getJobs } from "../api/client";
import type { Job } from "../types";

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this job posting?")) {
      return;
    }
    await deleteJob(id);
    setJobs((current) => current.filter((job) => job.id !== id));
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
          <a href={job.applicationUrl}>Apply</a>
          <button type="button" onClick={() => handleDelete(job.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
