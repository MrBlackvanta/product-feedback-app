import {
  CATEGORIES,
  CATEGORY_CHOICES,
  CATEGORY_LABEL,
  ROADMAP_STATUSES,
  STATUS_CHOICES,
  type Category,
} from "@/data";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import SelectField from "./select-field";

function Harness() {
  const [value, setValue] = useState<Category>("ui");

  return (
    <SelectField
      id="category"
      label="Category"
      hint="Choose a category for your feedback"
      options={CATEGORY_CHOICES}
      labels={CATEGORY_LABEL}
      value={value}
      onChange={setValue}
    />
  );
}

const combobox = () => screen.getByRole("combobox");
const listbox = () => screen.getByRole("listbox");

describe("choice lists", () => {
  it("offers every category the board can filter by, exactly once", () => {
    expect([...CATEGORY_CHOICES].sort()).toEqual([...CATEGORIES].sort());
  });

  it("offers every status a request can hold, exactly once", () => {
    expect([...STATUS_CHOICES].sort()).toEqual(
      ["suggestion", ...ROADMAP_STATUSES].sort(),
    );
  });
});

describe("SelectField", () => {
  it("is named by its label and described by its hint", () => {
    render(<Harness />);

    expect(combobox()).toHaveAccessibleName(/^Category/);
    expect(combobox()).toHaveAccessibleDescription(
      "Choose a category for your feedback",
    );
  });

  it("shows the current value and lists the options in order", async () => {
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
