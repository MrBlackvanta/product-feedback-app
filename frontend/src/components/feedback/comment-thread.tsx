"use client";

import { COMMENT_LIMIT, type User } from "@/data";
import type { EntryScope } from "@/lib/actions";
import { useId, useState } from "react";
import { useConversation, type Trouble } from "./conversation";
import submitOnCtrlEnter from "./ctrl-enter";
import DeleteDialog from "./delete-dialog";
import ReplyForm from "./reply-form";
import UserAvatar from "./user-avatar";

const TROUBLE_TEXT: Record<Trouble["act"], string> = {
  post: "That never left your screen.",
  edit: "That edit was not saved.",
  delete: "That is still here.",
};

type CommentThreadProps = {
  scope: EntryScope;
  id: number;
  commentId: number;
  author: User;
  content: string;
  replyingTo?: string;
  pending?: true;
  trouble?: Trouble;
};

export default function CommentThread({
  scope,
  id,
  commentId,
  author,
  content,
  replyingTo,
  pending,
  trouble,
}: CommentThreadProps) {
  const { viewer, edit, remove } = useConversation();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState(content);
  const field = useId();

  const mine = author.username === viewer.username;
  const live = id > 0 && !pending && !trouble;

  function startEditing() {
    setDraft(content);
    setEditing(true);
  }

  function save() {
    const next = draft.trim();

    setEditing(false);

    if (next && next !== content) edit(scope, id, next);
  }

  return (
    <article data-pending={pending} className="v-comment">
      <UserAvatar user={author} className="v-comment-avatar" />

      <div className="v-comment-name">
        <p className="text-body-3 md:text-h4 tracking-heading font-bold">
          {author.name}
        </p>
        <p className="text-body-3 text-ink-muted md:text-h4">
          {`@${author.username}`}
        </p>
      </div>

      {live && !editing && (
        <div className="v-comment-actions">
          <button
            type="button"
            aria-expanded={replying}
            onClick={() => setReplying(!replying)}
            className="v-comment-action text-action"
          >
            Reply
            <span className="sr-only">{` to @${author.username}`}</span>
          </button>

          {mine && (
            <>
              <button
                type="button"
                onClick={startEditing}
                className="v-comment-action text-action"
              >
                Edit
                <span className="sr-only">{` your ${scope}`}</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="v-comment-action text-danger"
              >
                Delete
                <span className="sr-only">{` your ${scope}`}</span>
              </button>
            </>
          )}
        </div>
      )}

      {editing ? (
        <form
          onSubmit={(submitted) => {
            submitted.preventDefault();
            save();
          }}
          className="v-comment-editor"
        >
          <label htmlFor={field} className="sr-only">
            {`Edit your ${scope}`}
          </label>

          <textarea
            id={field}
            autoFocus
            value={draft}
            maxLength={COMMENT_LIMIT}
            onChange={(changed) => setDraft(changed.target.value)}
            onKeyDown={(pressed) => {
              if (pressed.key === "Escape") {
                setEditing(false);
                return;
              }

              submitOnCtrlEnter(pressed);
            }}
            className="v-field h-20"
          />

          <div className="mt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="v-btn-neutral"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!draft.trim()}
              className="v-btn-accent"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <p className="v-comment-body">
          {replyingTo && (
            <>
              <span className="text-accent font-bold">{`@${replyingTo}`}</span>{" "}
            </>
          )}
          {content}
        </p>
      )}

      {trouble && (
        <p role="alert" className="v-comment-trouble">
          {TROUBLE_TEXT[trouble.act]}

          <button
            type="button"
            onClick={trouble.retry}
            className="v-comment-action text-action"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={trouble.discard}
            className="v-comment-action text-ink-muted"
          >
            Dismiss
          </button>
        </p>
      )}

      {replying && (
        <ReplyForm
          commentId={commentId}
          replyingTo={author.username}
          onDone={() => setReplying(false)}
        />
      )}

      {mine && (
        <DeleteDialog
          heading={`Delete this ${scope}?`}
          detail={
            scope === "comment"
              ? "Your comment and every reply under it will be permanently removed. This cannot be undone."
              : "Your reply will be permanently removed. This cannot be undone."
          }
          confirmLabel="Delete"
          open={confirming}
          onConfirm={() => {
            setConfirming(false);
            remove(scope, id);
          }}
          onClose={() => setConfirming(false)}
        />
      )}
    </article>
  );
}
