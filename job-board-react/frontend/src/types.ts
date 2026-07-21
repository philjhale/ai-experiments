export type EmploymentType = "FullTime" | "PartTime" | "Contract";
export type LocationType = "Remote" | "Onsite" | "Hybrid";

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType: EmploymentType;
  locationType: LocationType;
  applicationUrl: string;
  postedDate: string;
}

export type CreateJobInput = Omit<Job, "id" | "postedDate">;
