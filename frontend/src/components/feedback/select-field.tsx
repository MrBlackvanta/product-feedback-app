"use client";

import { ArrowDownIcon, CheckIcon } from "@/components/icons";
import { useEffect, useId, useRef, useState } from "react";

type SelectFieldProps<T extends string> = {
  id: string;
  label: string;
  hint: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
};

export default function SelectField<T extends string>({
  id,
  label,
  hint,
  options,
  labels,
  value,
  onChange,
}: SelectFieldProps<T>) {
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const last = options.length - 1;
  const selected = options.indexOf(value);
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
    onChange(options[index]);
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

  function onKeyDown(pressed: React.KeyboardEvent) {
    switch (pressed.key) {
      case "ArrowDown":
        pressed.preventDefault();
        moveTo(active === last ? 0 : active + 1);
        break;
      case "ArrowUp":
        pressed.preventDefault();
        moveTo(active === 0 ? last : active - 1);
        break;
      case "Home":
        pressed.preventDefault();
        moveTo(0);
        break;
      case "End":
        pressed.preventDefault();
        moveTo(last);
        break;
      case "Enter":
      case " ":
        pressed.preventDefault();
        if (open) choose(active);
        else show();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div>
      <label id={labelId} htmlFor={id} className="v-field-label">
        {label}
      </label>
      <p id={hintId} className="v-field-hint">
        {hint}
      </p>

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
          aria-labelledby={`${labelId} ${id}`}
          aria-describedby={hintId}
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={onKeyDown}
          className="v-select"
        >
          {labels[value]}
          <ArrowDownIcon className={open ? "rotate-180" : ""} />
        </button>

        <ul
          ref={panel}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          inert={!open}
          className={`v-menu v-menu-list w-full ${open ? "v-menu-open" : ""}`}
        >
          {options.map((choice, index) => (
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
              {labels[choice]}
              {choice === value && <CheckIcon aria-hidden="true" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
