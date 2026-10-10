"use client";

import { ArrowDownIcon, CheckIcon } from "@/components/icons";
import { CATEGORY_CHOICES, CATEGORY_LABEL, type Category } from "@/data";
import { useEffect, useId, useRef, useState } from "react";

const LAST = CATEGORY_CHOICES.length - 1;

type CategorySelectProps = {
  id: string;
  labelledBy: string;
  describedBy: string;
  value: Category;
  onChange: (value: Category) => void;
};

export default function CategorySelect({
  id,
  labelledBy,
  describedBy,
  value,
  onChange,
}: CategorySelectProps) {
  const selected = CATEGORY_CHOICES.indexOf(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLUListElement>(null);
  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(pressed: KeyboardEvent) {
      if (pressed.code === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        trigger.current?.contains(target) ||
        panel.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function show() {
    setActive(selected);
    setOpen(true);
  }

  function choose(index: number) {
    onChange(CATEGORY_CHOICES[index]);
    setOpen(false);
    trigger.current?.focus();
  }

  function moveTo(index: number) {
    if (open) {
      setActive(index);
    } else {
      show();
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(active === LAST ? 0 : active + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(active === 0 ? LAST : active - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(LAST);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) choose(active);
        else show();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className="relative mt-4">
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-labelledby={`${labelledBy} ${id}`}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className="v-select"
      >
        {CATEGORY_LABEL[value]}
        <ArrowDownIcon className={open ? "rotate-180" : ""} />
      </button>

      <ul
        ref={panel}
        id={listId}
        role="listbox"
        aria-label="Category"
        inert={!open}
        className={`v-menu v-menu-list w-full ${open ? "v-menu-open" : ""}`}
      >
        {CATEGORY_CHOICES.map((choice, index) => (
          <li
            key={choice}
            id={optionId(index)}
            role="option"
            tabIndex={-1}
            aria-selected={choice === value}
            data-active={open && index === active ? "" : undefined}
            onClick={() => choose(index)}
            className="v-menu-item"
          >
            {CATEGORY_LABEL[choice]}
            {choice === value && <CheckIcon aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
