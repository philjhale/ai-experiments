import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../api/client";
import type { CreateJobInput, EmploymentType, LocationType } from "../types";

const employmentTypes: EmploymentType[] = ["FullTime", "PartTime", "Contract"];
const locationTypes: LocationType[] = ["Remote", "Onsite", "Hybrid"];

const initialForm: CreateJobInput = {
  title: "",
  company: "",
  location: "",
  description: "",
  employmentType: "FullTime",
  locationType: "Remote",
  applicationUrl: "",
};

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validate(form: CreateJobInput) {
  const errors: Partial<Record<keyof CreateJobInput, string>> = {};

  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.company.trim()) errors.company = "Company is required";
  if (!form.location.trim()) errors.location = "Location is required";
  if (!form.description.trim()) errors.description = "Description is required";
  if (!form.applicationUrl.trim()) {
    errors.applicationUrl = "Application URL is required";
  } else if (!isValidUrl(form.applicationUrl)) {
    errors.applicationUrl = "Application URL must be a valid URL";
  }

  return errors;
}

export function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateJobInput>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateJobInput, string>>>({});

  function updateField<K extends keyof CreateJobInput>(field: K, value: CreateJobInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await createJob(form);
    navigate("/");
  }

  return (
    <form className="job-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          value={form.company}
          onChange={(e) => updateField("company", e.target.value)}
        />
        {errors.company && <p className="field-error">{errors.company}</p>}
      </div>

      <div className="field">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
        />
        {errors.location && <p className="field-error">{errors.location}</p>}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
        {errors.description && <p className="field-error">{errors.description}</p>}
      </div>

      <div className="field">
        <label htmlFor="employmentType">Employment Type</label>
        <select
          id="employmentType"
          value={form.employmentType}
          onChange={(e) => updateField("employmentType", e.target.value as EmploymentType)}
        >
          {employmentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="locationType">Location Type</label>
        <select
          id="locationType"
          value={form.locationType}
          onChange={(e) => updateField("locationType", e.target.value as LocationType)}
        >
          {locationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="applicationUrl">Application URL</label>
        <input
          id="applicationUrl"
          value={form.applicationUrl}
          onChange={(e) => updateField("applicationUrl", e.target.value)}
        />
        {errors.applicationUrl && <p className="field-error">{errors.applicationUrl}</p>}
      </div>

      <button type="submit" className="submit-button">
        Post Job
      </button>
    </form>
  );
}
