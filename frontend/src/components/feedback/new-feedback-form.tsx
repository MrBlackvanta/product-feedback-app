"use client";

import { NewFeedbackIcon } from "@/components/icons";
import { DEFAULT_CATEGORY, type Category } from "@/data";
import { createFeedback } from "@/lib/actions";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import CategorySelect from "./category-select";

type Errors = { title?: string; detail?: string };
type FormState = { errors: Errors; attempt: number };

const INITIAL: FormState = { errors: {}, attempt: 0 };

export default function NewFeedbackForm() {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY);
  const form = useRef<HTMLFormElement>(null);

  const [{ errors, attempt }, submit, pending] = useActionState<
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

    await createFeedback(headline, category, body);

    return INITIAL;
  }, INITIAL);

  useEffect(() => {
    const invalid = errors.title ? "title" : errors.detail ? "detail" : null;
    if (!invalid) return;

    const control = form.current?.elements.namedItem(invalid);
    if (control instanceof HTMLElement) control.focus();
  }, [errors]);

  return (
    <form ref={form} action={submit} noValidate className="v-form-card">
      <NewFeedbackIcon className="v-form-badge" />

      <h1 className="text-h3 md:text-h1 font-bold">Create New Feedback</h1>

      <div className="mt-6 space-y-6 md:mt-10">
        <div>
          <label htmlFor="title" className="v-field-label">
            Feedback Title
          </label>
          <p id="title-hint" className="v-field-hint">
            Add a short, descriptive headline
          </p>

          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={errors.title ? "true" : undefined}
            aria-describedby={
              errors.title ? "title-hint title-error" : "title-hint"
            }
            className="v-input mt-4"
          />

          {errors.title && (
            <p
              key={attempt}
              id="title-error"
              role="alert"
              className="v-field-error"
            >
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            id="category-label"
            htmlFor="category"
            className="v-field-label"
          >
            Category
          </label>
          <p id="category-hint" className="v-field-hint">
            Choose a category for your feedback
          </p>

          <CategorySelect
            id="category"
            labelledBy="category-label"
            describedBy="category-hint"
            value={category}
            onChange={setCategory}
          />
        </div>

        <div>
          <label htmlFor="detail" className="v-field-label">
            Feedback Detail
          </label>
          <p id="detail-hint" className="v-field-hint">
            Include any specific comments on what should be improved, added,
            etc.
          </p>

          <textarea
            id="detail"
            name="detail"
            required
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            aria-invalid={errors.detail ? "true" : undefined}
            aria-describedby={
              errors.detail ? "detail-hint detail-error" : "detail-hint"
            }
            className="v-field mt-4 h-30 md:h-24"
          />

          {errors.detail && (
            <p
              key={attempt}
              id="detail-error"
              role="alert"
              className="v-field-error"
            >
              {errors.detail}
            </p>
          )}
        </div>
      </div>

      <div className="v-form-actions">
        <Link href="/" className="v-btn-neutral">
          Cancel
        </Link>

        <button type="submit" disabled={pending} className="v-btn-accent">
          Add Feedback
        </button>
      </div>
    </form>
  );
}
