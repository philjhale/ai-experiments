import { z } from "zod";

export const employmentTypes = ["FullTime", "PartTime", "Contract"] as const;
export const locationTypes = ["Remote", "Onsite", "Hybrid"] as const;

export const createJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  employmentType: z.enum(employmentTypes),
  locationType: z.enum(locationTypes),
  applicationUrl: z.string().url(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
