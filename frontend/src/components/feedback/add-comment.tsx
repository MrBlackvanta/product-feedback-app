"use client";

import { postComment } from "@/lib/actions";
import { useActionState, useState } from "react";

const LIMIT = 250;

export default function AddComment({ id }: { id: number }) {
  const [content, setContent] = useState("");

  const [error, submit, pending] = useActionState<string | null, FormData>(
    async (_previous, data) => {
      const value = String(data.get("comment") ?? "").trim();

      if (!value) {
        return "Write a comment before posting.";
      }

      await postComment(id, value);
      setContent("");

      return null;
    },
    null,
  );

  const left = LIMIT - content.length;

  return (
    <section aria-labelledby="add-comment" className="v-comments-card">
      <h2 id="add-comment" className="text-h3 font-bold">
        Add Comment
      </h2>

      <form action={submit}>
        <label htmlFor="comment" className="sr-only">
          Add a comment
        </label>

        <textarea
          id="comment"
          name="comment"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={LIMIT}
          placeholder="Type your comment here"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "comment-error" : "comment-left"}
          className="v-field mt-6"
        />

        {error && (
          <p
            key={error}
            id="comment-error"
            role="alert"
            className="v-field-error"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p
            id="comment-left"
            className="text-body-3 text-ink-muted md:text-body-2"
          >
            {`${left} characters left`}
          </p>

          <button type="submit" disabled={pending} className="v-btn-accent">
            Post Comment
          </button>
        </div>
      </form>
    </section>
  );
}
