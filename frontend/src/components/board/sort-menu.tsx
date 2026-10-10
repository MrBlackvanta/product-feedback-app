"use client";

import { ArrowDownIcon, CheckIcon } from "@/components/icons";
import { SORTS, SORT_LABEL, type Category, type Sort } from "@/data";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { boardHref } from "./board-links";

type SortMenuProps = {
  sort: Sort;
  category: Category | null;
};

export default function SortMenu({ sort, category }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function close(restoreFocus: boolean) {
      setOpen(false);
      if (restoreFocus) trigger.current?.focus();
    }

    function onKeyDown(pressed: KeyboardEvent) {
      if (pressed.code === "Escape") close(true);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        trigger.current?.contains(target) ||
        panel.current?.contains(target)
      ) {
        return;
      }
      close(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="v-sort-trigger"
      >
        Sort by : {SORT_LABEL[sort]}
        <ArrowDownIcon className={open ? "rotate-180" : ""} />
      </button>

      <div
        id={panelId}
        ref={panel}
        inert={!open}
        className={`v-menu w-63.75 ${open ? "v-menu-open" : ""}`}
      >
        <ul className="v-menu-list">
          {SORTS.map((value) => (
            <li key={value}>
              <Link
                href={boardHref(category, value)}
                onClick={() => setOpen(false)}
                aria-current={value === sort ? "true" : undefined}
                className="v-menu-item"
              >
                {SORT_LABEL[value]}
                {value === sort && <CheckIcon aria-hidden="true" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
