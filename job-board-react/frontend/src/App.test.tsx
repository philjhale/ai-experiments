import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as client from "./api/client";

describe("App routing", () => {
  beforeEach(() => {
    vi.spyOn(client, "getJobs").mockResolvedValue([]);
  });

  it("renders the job list at /", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("link", { name: /post a job/i })).toBeInTheDocument();
  });

  it("navigates to /post via the nav link", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("link", { name: /post a job/i }));

    expect(await screen.findByRole("button", { name: /post job/i })).toBeInTheDocument();
  });
});
