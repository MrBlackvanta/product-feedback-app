"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type DeleteDialogProps = {
  heading: string;
  detail: ReactNode;
  confirmLabel: string;
  open: boolean;
  busy?: boolean;
  trouble?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteDialog({
  heading,
  detail,
  confirmLabel,
  open,
  busy,
  trouble,
  onConfirm,
  onClose,
}: DeleteDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;

    if (open) {
      element.showModal();
      cancel.current?.focus();
    } else if (element.open) {
      element.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-heading`}
      aria-describedby={`${id}-detail`}
      onClose={onClose}
      onClick={(clicked) => {
        if (clicked.target === dialog.current) onClose();
      }}
      className="v-dialog"
    >
      <div className="v-dialog-panel">
        <h2 id={`${id}-heading`} className="text-h3 md:text-h2 font-bold">
          {heading}
        </h2>

        <p
          id={`${id}-detail`}
          className="text-body-2 md:text-body-1 text-ink-muted mt-4"
        >
          {detail}
        </p>

        {trouble && (
          <p role="alert" className="v-field-error">
            {trouble}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4 md:mt-8 md:flex-row md:justify-end">
          <button
            ref={cancel}
            type="button"
            disabled={busy}
            onClick={onClose}
            className="v-btn-neutral"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="v-btn-danger"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
