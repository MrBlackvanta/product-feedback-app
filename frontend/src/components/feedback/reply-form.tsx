"use client";

import { COMMENT_LIMIT } from "@/data";
import { useId, useState } from "react";
import { useConversation } from "./conversation";
import submitOnCtrlEnter from "./ctrl-enter";

type ReplyFormProps = {
  commentId: number;
  replyingTo: string;
  onDone: () => void;
};

export default function ReplyForm({
  commentId,
  replyingTo,
  onDone,
}: ReplyFormProps) {
  const { reply } = useConversation();
  const [content, setContent] = useState("");
  const [attempts, setAttempts] = useState(0);
  const field = useId();

  const error =
    attempts > 0 && !content.trim() ? "Write a reply before posting." : "";

  return (
    <form
      onSubmit={(submitted) => {
        submitted.preventDefault();
        setAttempts(attempts + 1);

        const written = content.trim();

        if (!written) return;

        reply(commentId, replyingTo, written);
        onDone();
      }}
      className="v-comment-form"
    >
      <div className="w-full md:flex-1">
        <label htmlFor={field} className="sr-only">
          {`Reply to @${replyingTo}`}
        </label>

        <textarea
          id={field}
          autoFocus
          value={content}
          maxLength={COMMENT_LIMIT}
          onChange={(changed) => setContent(changed.target.value)}
          onKeyDown={(pressed) => {
            if (pressed.key === "Escape") {
              onDone();
              return;
            }

            submitOnCtrlEnter(pressed);
          }}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${field}-error` : undefined}
          className="v-field h-20"
        />

        {error && (
          <p
            key={attempts}
            id={`${field}-error`}
            role="alert"
            className="v-field-error"
          >
            {error}
          </p>
        )}
      </div>

      <button type="submit" className="v-btn-accent">
        Post Reply
      </button>
    </form>
  );
}
