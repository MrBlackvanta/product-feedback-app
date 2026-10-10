import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { installMatchMedia, resetMedia } from "./support/media";

Element.prototype.scrollIntoView ??= () => {};
Element.prototype.getAnimations ??= () => [];
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event("close"));
};

beforeEach(() => {
  installMatchMedia();
});

afterEach(() => {
  cleanup();
  resetMedia();
  localStorage.clear();
});
