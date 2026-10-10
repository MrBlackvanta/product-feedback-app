"use client";

import { useActionState, useEffect, useRef, useState } from "react";

type Errors = { title?: string; detail?: string };
type FormState = { errors: Errors; trouble?: string; attempt: number };

const INITIAL: FormState = { errors: {}, attempt: 0 };

const UNREACHABLE =
  "We couldn’t save that. The feedback service didn’t answer, so give it a moment and try again.";

export default function useFeedbackForm(
  initial: { title: string; detail: string },
  save: (title: string, detail: string) => Promise<void>,
) {
  const [title, setTitle] = useState(initial.title);
  const [detail, setDetail] = useState(initial.detail);
  const form = useRef<HTMLFormElement>(null);

  const [{ errors, trouble, attempt }, submit, pending] = useActionState<
    FormState,
    FormData
  >(async (previous) => {
    const headline = title.trim();
    const body = detail.trim();
    const found: Errors = {};

    if (!headline) found.title = "Give the request a title.";
    if (!body) found.detail = "Describe what you would like to see.";

    if (found.title || found.detail) {
      return { errors: found, attempt: previous.attempt + 1 };
    }

    try {
      await save(headline, body);
    } catch {
      return { errors: {}, trouble: UNREACHABLE, attempt: previous.attempt + 1 };
    }

    return INITIAL;
  }, INITIAL);

  useEffect(() => {
    const invalid = errors.title ? "title" : errors.detail ? "detail" : null;
    if (!invalid) return;

    const control = form.current?.elements.namedItem(invalid);
    if (control instanceof HTMLElement) control.focus();
  }, [errors]);

  return {
    form,
    title,
    setTitle,
    detail,
    setDetail,
    errors,
    trouble,
    attempt,
    submit,
    pending,
  };
}
