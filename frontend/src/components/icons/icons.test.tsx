import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as icons from ".";

const entries = Object.entries(icons);

describe("icons", () => {
  it("exports every icon through the barrel", () => {
    expect(entries.length).toBe(10);
  });

  it.each(entries)("%s is hidden from assistive technology", (_name, Icon) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it.each(entries)("%s accepts a caller's attributes", (_name, Icon) => {
    const { container } = render(<Icon data-probe="set" />);

    expect(container.querySelector("svg")).toHaveAttribute("data-probe", "set");
  });

  it("gives each gradient its own id, so two on one page cannot collide", () => {
    const { container } = render(
      <>
        <icons.NewFeedbackIcon />
        <icons.EditFeedbackIcon />
      </>,
    );

    const ids = [...container.querySelectorAll("radialGradient")].map(
      (gradient) => gradient.id,
    );

    expect(new Set(ids).size).toBe(ids.length);
  });
});
