import { deleteFeedback, updateFeedback } from "@/lib/actions";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditFeedbackForm from "./edit-feedback-form";

vi.mock("@/lib/actions", () => ({
  updateFeedback: vi.fn(),
  deleteFeedback: vi.fn(),
}));

const saved = vi.mocked(updateFeedback);
const removed = vi.mocked(deleteFeedback);

const FEEDBACK = {
  id: 7,
  title: "Add a dark theme option",
  category: "feature",
  status: "planned",
  description: "It would help people with light sensitivities.",
} as const;

function renderForm() {
  render(<EditFeedbackForm feedback={{ ...FEEDBACK }} />);
}

const save = () => screen.getByRole("button", { name: "Save Changes" });
const category = () => screen.getByRole("combobox", { name: /^Category/ });
const status = () => screen.getByRole("combobox", { name: /^Update Status/ });

beforeEach(() => {
  saved.mockReset();
  removed.mockReset();
});

describe("EditFeedbackForm", () => {
  it("names the request it is editing", () => {
    renderForm();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Editing ‘Add a dark theme option’",
    );
  });

  it("opens with every field holding the stored value", () => {
    renderForm();

    expect(screen.getByLabelText("Feedback Title")).toHaveValue(FEEDBACK.title);
    expect(screen.getByLabelText("Feedback Detail")).toHaveValue(
      FEEDBACK.description,
    );
    expect(category()).toHaveTextContent("Feature");
    expect(status()).toHaveTextContent("Planned");
  });

  it("offers all four states, with the stored one selected", async () => {
    renderForm();
    await userEvent.click(status());

    const options = within(
      screen.getByRole("listbox", { name: "Update Status" }),
    ).getAllByRole("option");

    expect(options.map((option) => option.textContent)).toEqual([
      "Suggestion",
      "Planned",
      "In-Progress",
      "Live",
    ]);
    expect(options.filter((option) => option.ariaSelected === "true")).toEqual([
      options[1],
    ]);
  });

  it("saves the edited values against the same request", async () => {
    renderForm();

    await userEvent.clear(screen.getByLabelText("Feedback Title"));
    await userEvent.type(
      screen.getByLabelText("Feedback Title"),
      "  Add a dark mode  ",
    );
    await userEvent.click(status());
    await userEvent.click(screen.getByRole("option", { name: "Live" }));
    await userEvent.click(save());

    expect(saved).toHaveBeenCalledWith(
      7,
      "Add a dark mode",
      "feature",
      "live",
      FEEDBACK.description,
    );
  });

  it("refuses to save a request whose title was cleared", async () => {
    renderForm();

    await userEvent.clear(screen.getByLabelText("Feedback Title"));
    await userEvent.click(save());

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText("Feedback Title")).toBeInvalid();
    expect(saved).not.toHaveBeenCalled();
  });

  it("asks before deleting rather than deleting on the spot", async () => {
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "Delete this feedback request?",
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      /Add a dark theme option/,
    );
    expect(removed).not.toHaveBeenCalled();
  });

  it("deletes the request once the dialog is confirmed", async () => {
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Delete Request",
      }),
    );

    expect(removed).toHaveBeenCalledWith(7);
  });

  it("keeps the request when the dialog is dismissed", async () => {
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(removed).not.toHaveBeenCalled();
  });

  it("puts the keyboard on the safe choice when the dialog opens", async () => {
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Cancel",
      }),
    ).toHaveFocus();
  });

  it("cancels back to the request rather than the board", () => {
    renderForm();

    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/feedback/7",
    );
  });

  it("reaches Save Changes before Delete when tabbing out of the form", async () => {
    renderForm();
    screen.getByLabelText("Feedback Detail").focus();

    await userEvent.tab();
    expect(save()).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
  });
});
