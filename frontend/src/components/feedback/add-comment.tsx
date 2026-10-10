"use client";

import { COMMENT_LIMIT } from "@/data";
import { useState } from "react";
import { useConversation } from "./conversation";
import submitOnCtrlEnter from "./ctrl-enter";

export default function AddComment() {
  const { comment } = useConversation();
  const [content, setContent] = useState("");
  const [attempts, setAttempts] = useState(0);

  const error =
    attempts > 0 && !content.trim() ? "Write a comment before posting." : "";
  const left = COMMENT_LIMIT - content.length;

  return (
    <section aria-labelledby="add-comment" className="v-comments-card">
      <h2 id="add-comment" className="text-h3 font-bold">
        Add Comment
      </h2>

      <form
        onSubmit={(submitted) => {
          submitted.preventDefault();
          setAttempts(attempts + 1);

          const written = content.trim();

          if (!written) return;

          comment(written);
          setContent("");
          setAttempts(0);
        }}
      >
        <label htmlFor="comment" className="sr-only">
          Add a comment
        </label>

        <textarea
          id="comment"
          name="comment"
          value={content}
          onChange={(changed) => setContent(changed.target.value)}
          onKeyDown={submitOnCtrlEnter}
          maxLength={COMMENT_LIMIT}
          placeholder="Type your comment here"
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "comment-error" : "comment-left"}
          className="v-field mt-6 h-20"
        />

        {error && (
          <p
            key={attempts}
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

          <button type="submit" className="v-btn-accent">
            Post Comment
          </button>
        </div>
      </form>
    </section>
  );
}
