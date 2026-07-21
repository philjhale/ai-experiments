import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PostJob } from "./PostJob";
import * as client from "../api/client";
import type { Job } from "../types";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/title/i), "Software Engineer");
  await user.type(screen.getByLabelText(/company/i), "Acme");
  await user.type(screen.getByLabelText(/location$/i), "Remote");
  await user.type(screen.getByLabelText(/description/i), "Build things");
  await user.selectOptions(screen.getByLabelText(/employment type/i), "FullTime");
  await user.selectOptions(screen.getByLabelText(/location type/i), "Remote");
  await user.type(screen.getByLabelText(/application url/i), "https://example.com/apply");
}

describe("PostJob", () => {
  beforeEach(() => {
    vi.spyOn(client, "createJob").mockResolvedValue({} as Job);
    navigateMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows validation errors and does not call the API on invalid submit", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PostJob />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/application url/i), "not-a-url");
    await user.click(screen.getByRole("button", { name: /post job/i }));

    expect(await screen.findAllByText(/required|valid url/i)).not.toHaveLength(0);
    expect(client.createJob).not.toHaveBeenCalled();
  });

  it("rejects an applicationUrl with a disallowed scheme", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PostJob />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/application url/i), "javascript:alert(1)");
    await user.click(screen.getByRole("button", { name: /post job/i }));

    expect(await screen.findByText(/valid url/i)).toBeInTheDocument();
    expect(client.createJob).not.toHaveBeenCalled();
  });

  it("shows an error message and does not navigate if createJob fails", async () => {
    (client.createJob as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to create job (400)"));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PostJob />
      </MemoryRouter>,
    );

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /post job/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/failed to post job/i);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("submits valid data and redirects to /", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PostJob />
      </MemoryRouter>,
    );

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /post job/i }));

    expect(client.createJob).toHaveBeenCalledWith({
      title: "Software Engineer",
      company: "Acme",
      location: "Remote",
      description: "Build things",
      employmentType: "FullTime",
      locationType: "Remote",
      applicationUrl: "https://example.com/apply",
    });
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
