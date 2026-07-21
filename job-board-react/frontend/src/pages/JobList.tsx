import { useEffect, useState } from "react";
import { deleteJob, getJobs } from "../api/client";
import type { Job } from "../types";

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch(() => setError("Failed to load jobs. Please try again later."));
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this job posting?")) {
      return;
    }
    setDeleteError(null);
    try {
      await deleteJob(id);
      setJobs((current) => current.filter((job) => job.id !== id));
    } catch {
      setDeleteError("Failed to delete job. Please try again.");
    }
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (jobs.length === 0) {
    return <p className="empty-state">No jobs posted yet.</p>;
  }

  return (
    <>
      {deleteError && <p role="alert">{deleteError}</p>}
      <ul className="job-list">
        {jobs.map((job) => (
          <li key={job.id} className="job-card">
            <div className="job-card__header">
              <h3>{job.title}</h3>
            </div>
            <p className="job-card__meta">
              {job.company} &middot; {job.location}
            </p>
            <div className="job-card__tags">
              <span className="tag">{job.employmentType}</span>
              <span className="tag">{job.locationType}</span>
            </div>
            <p className="job-card__description">{job.description}</p>
            <div className="job-card__actions">
              <a href={job.applicationUrl} className="apply-link" rel="noopener noreferrer">
                Apply
              </a>
              <button type="button" className="delete-link" onClick={() => handleDelete(job.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
