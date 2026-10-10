"use client";

import { postReply } from "@/lib/actions";
import { useActionState } from "react";

type ReplyFormProps = {
  id: number;
  commentId: number;
  replyingTo: string;
  onPosted: () => void;
};

export default function ReplyForm({
  id,
  commentId,
  replyingTo,
  onPosted,
}: ReplyFormProps) {
  const [error, submit, pending] = useActionState<string | null, FormData>(
    async (_previous, data) => {
      const content = String(data.get("reply") ?? "").trim();

      if (!content) {
        return "Write a reply before posting.";
      }

      await postReply(id, commentId, replyingTo, content);
      onPosted();

      return null;
    },
    null,
  );

  const errorId = `reply-error-${commentId}`;

  return (
    <form action={submit} className="v-comment-form">
      <div className="w-full md:flex-1">
        <label htmlFor={`reply-${commentId}`} className="sr-only">
          {`Reply to @${replyingTo}`}
        </label>

        <textarea
          id={`reply-${commentId}`}
          name="reply"
          autoFocus
          maxLength={250}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className="v-field h-20"
        />

        {error && (
          <p key={error} id={errorId} role="alert" className="v-field-error">
            {error}
          </p>
        )}
      </div>

      <button type="submit" disabled={pending} className="v-btn-accent">
        Post Reply
      </button>
    </form>
  );
}
