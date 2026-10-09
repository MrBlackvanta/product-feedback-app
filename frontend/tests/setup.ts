import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { installMatchMedia, resetMedia } from "./support/media";

Element.prototype.scrollIntoView ??= () => {};
Element.prototype.getAnimations ??= () => [];

beforeEach(() => {
  installMatchMedia();
});

afterEach(() => {
  cleanup();
  resetMedia();
  localStorage.clear();
});
