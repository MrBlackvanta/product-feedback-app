import { CATEGORIES, CATEGORY_CHOICES } from "@/data";
import { createFeedback } from "@/lib/actions";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategorySelect from "./category-select";
import NewFeedbackForm from "./new-feedback-form";

vi.mock("@/lib/actions", () => ({ createFeedback: vi.fn() }));

const mocked = vi.mocked(createFeedback);

beforeEach(() => {
  mocked.mockReset();
});

function Harness() {
  const [value, setValue] = useState<(typeof CATEGORY_CHOICES)[number]>("ui");

  return (
    <>
      <span id="lbl">Category</span>
      <p id="hint">Choose a category for your feedback</p>
      <CategorySelect
        id="category"
        labelledBy="lbl"
        describedBy="hint"
        value={value}
        onChange={setValue}
      />
    </>
  );
}

const combobox = () => screen.getByRole("combobox");
const listbox = () => screen.getByRole("listbox");

describe("CATEGORY_CHOICES", () => {
  it("offers every category the board can filter by, exactly once", () => {
    expect([...CATEGORY_CHOICES].sort()).toEqual([...CATEGORIES].sort());
  });
});

describe("CategorySelect", () => {
  it("shows the current value and leads the list with Feature", async () => {
    render(<Harness />);

    expect(combobox()).toHaveTextContent("UI");
    await userEvent.click(combobox());

    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Feature",
      "UI",
      "UX",
      "Enhancement",
      "Bug",
    ]);
  });

  it("keeps the listbox inert until it is opened", async () => {
    render(<Harness />);

    expect(combobox()).toHaveAttribute("aria-expanded", "false");
    expect(listbox()).toHaveAttribute("inert");

    await userEvent.click(combobox());

    expect(combobox()).toHaveAttribute("aria-expanded", "true");
    expect(listbox()).not.toHaveAttribute("inert");
  });

  it("marks only the current value as selected", async () => {
    render(<Harness />);
    await userEvent.click(combobox());

    const selected = screen.getAllByRole("option", { selected: true });

    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent("UI");
  });

  it("commits the option that was clicked and closes", async () => {
    render(<Harness />);
    await userEvent.click(combobox());
    await userEvent.click(screen.getByRole("option", { name: "Bug" }));

    expect(combobox()).toHaveTextContent("Bug");
    expect(combobox()).toHaveAttribute("aria-expanded", "false");
  });

  it("walks the list from the keyboard and commits with Enter", async () => {
    render(<Harness />);
    combobox().focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(combobox()).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(combobox()).toHaveTextContent("Enhancement");
    expect(combobox()).toHaveFocus();
  });

  it("wraps off the top of the list onto the last option", async () => {
    render(<Harness />);
    combobox().focus();

    await userEvent.keyboard("{ArrowDown}{Home}{ArrowUp}{Enter}");

    expect(combobox()).toHaveTextContent("Bug");
  });

  it("wraps off the bottom of the list onto the first option", async () => {
    render(<Harness />);
    combobox().focus();

    await userEvent.keyboard("{ArrowDown}{End}{ArrowDown}{Enter}");

    expect(combobox()).toHaveTextContent("Feature");
  });

  it("leaves the value alone when Escape closes the list", async () => {
    render(<Harness />);
    combobox().focus();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Escape}");

    expect(combobox()).toHaveTextContent("UI");
    expect(combobox()).toHaveAttribute("aria-expanded", "false");
  });
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
    expect(combobox()).toHaveAccessibleDescription(
      "Choose a category for your feedback",
    );
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
    await userEvent.click(combobox());
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
