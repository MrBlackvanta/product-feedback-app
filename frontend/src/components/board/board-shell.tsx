"use client";

import { CloseIcon, HamburgerIcon } from "@/components/icons";
import { SITE_NAME } from "@/data";
import { useEffect, useRef, useState } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

type BoardShellProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function BoardShell({ sidebar, children }: BoardShellProps) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 48rem)");
    const collapse = () => setOpen(false);

    wide.addEventListener("change", collapse);

    return () => wide.removeEventListener("change", collapse);
  }, []);

  useEffect(() => {
    if (!open) return;

    const { scrollY } = window;
    const { body } = document;

    body.style.position = "fixed";
    body.style.top = `${-scrollY}px`;
    body.style.insetInline = "0";

    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => panel.current?.focus()),
    );

    function onKeyDown(pressed: KeyboardEvent) {
      if (pressed.code === "Escape") {
        setOpen(false);
        toggle.current?.focus();
        return;
      }

      if (pressed.code !== "Tab" || !panel.current) return;

      const stops = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const leaving = pressed.shiftKey
        ? document.activeElement === stops.at(0) ||
          document.activeElement === panel.current
        : document.activeElement === stops.at(-1);

      if (!leaving) return;

      pressed.preventDefault();
      (pressed.shiftKey ? stops.at(-1) : stops.at(0))?.focus();
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      body.style.position = "";
      body.style.top = "";
      body.style.insetInline = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <div className="v-board">
      <header className="v-board-header">
        <div>
          <h1 className="text-wordmark md:text-h2 font-bold">{SITE_NAME}</h1>
          <p className="text-body-3 md:text-wordmark font-medium">
            Feedback Board
          </p>
        </div>

        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls="board-sidebar"
          onClick={() => setOpen(!open)}
          className="v-menu-toggle"
        >
          {open ? <CloseIcon /> : <HamburgerIcon />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </header>

      <div
        aria-hidden="true"
        data-open={open || undefined}
        onClick={() => setOpen(false)}
        className="v-scrim"
      />

      <aside
        id="board-sidebar"
        ref={panel}
        tabIndex={-1}
        data-open={open || undefined}
        className="v-board-aside"
      >
        {sidebar}
      </aside>

      <main className="v-board-main">{children}</main>
    </div>
  );
}
