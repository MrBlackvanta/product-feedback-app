import { createFeedback } from "@/lib/actions";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewFeedbackForm from "./new-feedback-form";

vi.mock("@/lib/actions", () => ({ createFeedback: vi.fn() }));

const mocked = vi.mocked(createFeedback);

beforeEach(() => {
  mocked.mockReset();
});

describe("NewFeedbackForm", () => {
  it("describes every control with its own hint", () => {
    render(<NewFeedbackForm />);

    expect(screen.getByLabelText("Feedback Title")).toHaveAccessibleDescription(
      "Add a short, descriptive headline",
    );
    expect(
      screen.getByLabelText("Feedback Detail"),
    ).toHaveAccessibleDescription(
      "Include any specific comments on what should be improved, added, etc.",
    );
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
      "Choose a category for your feedback",
    );
  });

  it("starts empty, on the default category", () => {
    render(<NewFeedbackForm />);

    expect(screen.getByLabelText("Feedback Title")).toHaveValue("");
    expect(screen.getByLabelText("Feedback Detail")).toHaveValue("");
    expect(screen.getByRole("combobox")).toHaveTextContent("Feature");
  });

  it("refuses an empty submit and says so on both fields", async () => {
    render(<NewFeedbackForm />);

    await userEvent.click(screen.getByRole("button", { name: "Add Feedback" }));

    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(screen.getByLabelText("Feedback Title")).toBeInvalid();
    expect(screen.getByLabelText("Feedback Detail")).toBeInvalid();
    expect(mocked).not.toHaveBeenCalled();
  });

  it("moves focus to the first field that failed", async () => {
    render(<NewFeedbackForm />);

    await userEvent.click(screen.getByRole("button", { name: "Add Feedback" }));

    expect(screen.getByLabelText("Feedback Title")).toHaveFocus();
  });

  it("treats whitespace as empty", async () => {
    render(<NewFeedbackForm />);

    await userEvent.type(screen.getByLabelText("Feedback Title"), "   ");
    await userEvent.type(screen.getByLabelText("Feedback Detail"), "  ");
    await userEvent.click(screen.getByRole("button", { name: "Add Feedback" }));

    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(mocked).not.toHaveBeenCalled();
  });

  it("keeps what was typed when the other field fails", async () => {
    render(<NewFeedbackForm />);

    await userEvent.type(screen.getByLabelText("Feedback Title"), "Dark mode");
    await userEvent.click(screen.getByRole("button", { name: "Add Feedback" }));

    expect(screen.getByLabelText("Feedback Title")).toHaveValue("Dark mode");
  });

  it("clears a message as soon as that field is filled in", async () => {
    render(<NewFeedbackForm />);

    await userEvent.click(screen.getByRole("button", { name: "Add Feedback" }));
    await userEvent.type(screen.getByLabelText("Feedback Title"), "Dark mode");
    await userEvent.click(screen.getByRole("button", { name: "Add Feedback" }));

    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByLabelText("Feedback Title")).toBeValid();
    expect(screen.getByLabelText("Feedback Detail")).toBeInvalid();
  });

  it("sends trimmed values with the category that was picked", async () => {
    render(<NewFeedbackForm />);

    await userEvent.type(
      screen.getByLabelText("Feedback Title"),
      "  Dark mode  ",
    );
    await userEvent.type(
      screen.getByLabelText("Feedback Detail"),
      "  Easier on the eyes at night.  ",
    );
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "UX" }));
    await userEvent.click(screen.getByRole("button", { name: "Add Feedback" }));

    expect(mocked).toHaveBeenCalledWith(
      "Dark mode",
      "ux",
      "Easier on the eyes at night.",
    );
  });

  it("offers a way back to the board that is a real link", () => {
    render(<NewFeedbackForm />);

    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
