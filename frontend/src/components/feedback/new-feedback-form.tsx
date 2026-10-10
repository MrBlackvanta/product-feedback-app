"use client";

import { NewFeedbackIcon } from "@/components/icons";
import {
  CATEGORY_CHOICES,
  CATEGORY_LABEL,
  DEFAULT_CATEGORY,
  type Category,
} from "@/data";
import { createFeedback } from "@/lib/actions";
import Link from "next/link";
import { useState } from "react";
import SelectField from "./select-field";
import TextField from "./text-field";
import useFeedbackForm from "./use-feedback-form";

const EMPTY = { title: "", detail: "" };

export default function NewFeedbackForm() {
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY);

  const {
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
  } = useFeedbackForm(EMPTY, (headline, body) =>
    createFeedback(headline, category, body),
  );

  return (
    <form ref={form} action={submit} noValidate className="v-form-card">
      <NewFeedbackIcon className="v-form-badge" />

      <h1 className="text-h3 md:text-h1 font-bold">Create New Feedback</h1>

      <div className="mt-6 space-y-6 md:mt-10">
        <TextField
          id="title"
          label="Feedback Title"
          hint="Add a short, descriptive headline"
          value={title}
          onChange={setTitle}
          error={errors.title}
          attempt={attempt}
        />

        <SelectField
          id="category"
          label="Category"
          hint="Choose a category for your feedback"
          options={CATEGORY_CHOICES}
          labels={CATEGORY_LABEL}
          value={category}
          onChange={setCategory}
        />

        <TextField
          id="detail"
          label="Feedback Detail"
          hint="Include any specific comments on what should be improved, added, etc."
          value={detail}
          onChange={setDetail}
          error={errors.detail}
          attempt={attempt}
          multiline
        />
      </div>

      {trouble && (
        <p key={attempt} role="alert" className="v-field-error">
          {trouble}
        </p>
      )}

      <div className="v-form-actions flex-col-reverse md:flex-row">
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
