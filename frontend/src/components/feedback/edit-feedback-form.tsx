"use client";

import { EditFeedbackIcon } from "@/components/icons";
import {
  CATEGORY_CHOICES,
  CATEGORY_LABEL,
  STATUS_CHOICES,
  STATUS_LABEL,
  type Category,
  type Feedback,
  type Status,
} from "@/data";
import { deleteFeedback, updateFeedback } from "@/lib/actions";
import Link from "next/link";
import { useState, useTransition } from "react";
import SelectField from "./select-field";
import TextField from "./text-field";
import useFeedbackForm from "./use-feedback-form";

type EditFeedbackFormProps = {
  feedback: Omit<Feedback, "upvotes" | "commentCount">;
};

export default function EditFeedbackForm({ feedback }: EditFeedbackFormProps) {
  const [category, setCategory] = useState<Category>(feedback.category);
  const [status, setStatus] = useState<Status>(feedback.status);
  const [removing, startRemoving] = useTransition();

  const {
    form,
    title,
    setTitle,
    detail,
    setDetail,
    errors,
    attempt,
    submit,
    pending,
  } = useFeedbackForm(
    { title: feedback.title, detail: feedback.description },
    (headline, body) =>
      updateFeedback(feedback.id, headline, category, status, body),
  );

  const busy = pending || removing;

  return (
    <form ref={form} action={submit} noValidate className="v-form-card">
      <EditFeedbackIcon className="v-form-badge" />

      <h1 className="text-h3 md:text-h1 font-bold">
        Editing ‘{feedback.title}’
      </h1>

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

        <SelectField
          id="status"
          label="Update Status"
          hint="Change feature state"
          options={STATUS_CHOICES}
          labels={STATUS_LABEL}
          value={status}
          onChange={setStatus}
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

      <div className="v-form-actions flex-col md:flex-row">
        <button
          type="submit"
          disabled={busy}
          className="v-btn-accent md:order-3"
        >
          Save Changes
        </button>

        <Link
          href={`/feedback/${feedback.id}`}
          className="v-btn-neutral md:order-2"
        >
          Cancel
        </Link>

        <button
          type="button"
          onClick={() => startRemoving(() => deleteFeedback(feedback.id))}
          disabled={busy}
          className="v-btn-danger md:order-1 md:mr-auto"
        >
          Delete
        </button>
      </div>
    </form>
  );
}
