"use client";

import { useState } from "react";
import ReplyForm from "./reply-form";

type ReplyControlProps = {
  id: number;
  commentId: number;
  replyingTo: string;
};

export default function ReplyControl({
  id,
  commentId,
  replyingTo,
}: ReplyControlProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="v-comment-reply"
      >
        Reply
        <span className="sr-only">{` to @${replyingTo}`}</span>
      </button>

      {open && (
        <ReplyForm
          id={id}
          commentId={commentId}
          replyingTo={replyingTo}
          onPosted={() => setOpen(false)}
        />
      )}
    </>
  );
}
