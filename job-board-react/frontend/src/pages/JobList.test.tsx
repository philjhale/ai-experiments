import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JobList } from "./JobList";
import * as client from "../api/client";
import type { Job } from "../types";

const jobs: Job[] = [
  {
    id: 1,
    title: "Older Job",
    company: "Acme",
    location: "Remote",
    description: "desc 1",
    employmentType: "FullTime",
    locationType: "Remote",
    applicationUrl: "https://example.com/1",
    postedDate: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    title: "Newer Job",
    company: "Globex",
    location: "NYC",
    description: "desc 2",
    employmentType: "Contract",
    locationType: "Onsite",
    applicationUrl: "https://example.com/2",
    postedDate: "2026-02-01T00:00:00.000Z",
  },
];

describe("JobList", () => {
  beforeEach(() => {
    vi.spyOn(client, "getJobs").mockResolvedValue(jobs);
    vi.spyOn(client, "deleteJob").mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders jobs in the order returned by getJobs", async () => {
    render(<JobList />);

    const titles = await screen.findAllByRole("heading", { level: 3 });
    expect(titles.map((t) => t.textContent)).toEqual(["Older Job", "Newer Job"]);
  });

  it("does not delete the job if the confirmation is declined", async () => {
    const user = userEvent.setup();
    render(<JobList />);

    const item = (await screen.findByText("Older Job")).closest("li")!;
    await user.click(within(item).getByRole("button", { name: /delete/i }));

    expect(client.deleteJob).not.toHaveBeenCalled();
    expect(screen.getByText("Older Job")).toBeInTheDocument();
  });

  it("deletes the job when the confirmation is accepted", async () => {
    (window.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const user = userEvent.setup();
    render(<JobList />);

    const item = (await screen.findByText("Older Job")).closest("li")!;
    await user.click(within(item).getByRole("button", { name: /delete/i }));

    expect(client.deleteJob).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(screen.queryByText("Older Job")).not.toBeInTheDocument();
    });
  });

  it("shows an error message if the initial fetch fails", async () => {
    (client.getJobs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch jobs (500)"));
    render(<JobList />);

    expect(await screen.findByText(/failed to load jobs/i)).toBeInTheDocument();
  });

  it("shows an error message and keeps the job if deleteJob fails", async () => {
    (window.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (client.deleteJob as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to delete job (500)"));
    const user = userEvent.setup();
    render(<JobList />);

    const item = (await screen.findByText("Older Job")).closest("li")!;
    await user.click(within(item).getByRole("button", { name: /delete/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/failed to delete job/i);
    expect(screen.getByText("Older Job")).toBeInTheDocument();
  });
});
