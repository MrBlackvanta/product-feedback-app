"use client";

import type { Comment, Reply, User } from "@/data";
import {
  editEntry,
  postComment,
  postReply,
  removeEntry,
  type EntryScope,
} from "@/lib/actions";
import {
  createContext,
  useContext,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from "react";

export type Trouble = {
  act: "post" | "edit" | "delete";
  retry: () => void;
  discard: () => void;
};

export type ThreadReply = Reply & { pending?: true; trouble?: Trouble };

export type Thread = Omit<Comment, "replies"> & {
  replies: ThreadReply[];
  pending?: true;
  trouble?: Trouble;
};

type Replying = { commentId: number; username: string };

type Draft =
  | {
      act: "post";
      id: number;
      content: string;
      author: User;
      to: Replying | null;
    }
  | { act: "edit"; scope: EntryScope; id: number; content: string }
  | { act: "delete"; scope: EntryScope; id: number };

type Change = { ticket: number; draft: Draft; trouble?: Trouble };

type Conversation = {
  viewer: User;
  comments: Thread[];
  count: number;
  comment: (content: string) => void;
  reply: (commentId: number, username: string, content: string) => void;
  edit: (scope: EntryScope, entryId: number, content: string) => void;
  remove: (scope: EntryScope, entryId: number) => void;
};

const ConversationContext = createContext<Conversation | null>(null);

let drafted = 0;

const draftId = () => (drafted -= 1);

function inComments(
  comments: Thread[],
  id: number,
  change: (comment: Thread) => Thread[],
) {
  return comments.flatMap((comment) =>
    comment.id === id ? change(comment) : [comment],
  );
}

function inReplies(
  comments: Thread[],
  id: number,
  change: (reply: ThreadReply) => ThreadReply[],
) {
  return comments.map((comment) =>
    comment.replies.some((reply) => reply.id === id)
      ? {
          ...comment,
          replies: comment.replies.flatMap((reply) =>
            reply.id === id ? change(reply) : [reply],
          ),
        }
      : comment,
  );
}

function apply(comments: Thread[], { draft, trouble }: Change): Thread[] {
  const pending = trouble ? undefined : (true as const);

  if (draft.act === "post") {
    const posted = {
      id: draft.id,
      content: draft.content,
      author: draft.author,
      pending,
      trouble,
    };
    const { to } = draft;

    if (!to) {
      return comments.some((comment) => comment.id === posted.id)
        ? inComments(comments, posted.id, (comment) => [
            { ...comment, ...posted },
          ])
        : [...comments, { ...posted, replies: [] }];
    }

    return inComments(comments, to.commentId, (comment) => [
      {
        ...comment,
        replies: comment.replies.some((reply) => reply.id === posted.id)
          ? comment.replies.map((reply) =>
              reply.id === posted.id ? { ...reply, ...posted } : reply,
            )
          : [...comment.replies, { ...posted, replyingTo: to.username }],
      },
    ]);
  }

  if (draft.act === "edit") {
    const { content } = draft;

    return draft.scope === "comment"
      ? inComments(comments, draft.id, (comment) => [
          { ...comment, content, pending, trouble },
        ])
      : inReplies(comments, draft.id, (reply) => [
          { ...reply, content, pending, trouble },
        ]);
  }

  return draft.scope === "comment"
    ? inComments(comments, draft.id, (comment) =>
        trouble ? [{ ...comment, trouble }] : [],
      )
    : inReplies(comments, draft.id, (reply) =>
        trouble ? [{ ...reply, trouble }] : [],
      );
}

function countEntries(comments: Thread[]) {
  const landed = (entry: { trouble?: Trouble }) =>
    entry.trouble?.act !== "post";

  return comments.reduce(
    (total, comment) =>
      total + (landed(comment) ? 1 : 0) + comment.replies.filter(landed).length,
    0,
  );
}

export function useConversation() {
  const conversation = useContext(ConversationContext);

  if (!conversation) {
    throw new Error("A comment was rendered outside its Conversation");
  }

  return conversation;
}

type ConversationProps = {
  id: number;
  viewer: User;
  comments: Comment[];
  children: ReactNode;
};

export default function Conversation({
  id,
  viewer,
  comments,
  children,
}: ConversationProps) {
  const [troubles, setTroubles] = useState<Change[]>([]);
  const [landed, record] = useOptimistic<Thread[], Change>(comments, apply);
  const [, startTransition] = useTransition();

  function run(draft: Draft, send: () => Promise<void>) {
    const ticket = draftId();
    const forget = () =>
      setTroubles((current) =>
        current.filter((held) => held.ticket !== ticket),
      );

    function attempt() {
      forget();

      startTransition(async () => {
        record({ ticket, draft });

        try {
          await send();
        } catch {
          setTroubles((current) => [...current, { ticket, draft, trouble }]);
        }
      });
    }

    const trouble: Trouble = {
      act: draft.act,
      retry: attempt,
      discard: forget,
    };

    attempt();
  }

  const shown = troubles.reduce(apply, landed);

  const conversation: Conversation = {
    viewer,
    comments: shown,
    count: countEntries(shown),
    comment: (content) =>
      run(
        { act: "post", id: draftId(), content, author: viewer, to: null },
        () => postComment(id, content),
      ),
    reply: (commentId, username, content) =>
      run(
        {
          act: "post",
          id: draftId(),
          content,
          author: viewer,
          to: { commentId, username },
        },
        () => postReply(id, commentId, username, content),
      ),
    edit: (scope, entryId, content) =>
      run({ act: "edit", scope, id: entryId, content }, () =>
        editEntry(id, scope, entryId, content),
      ),
    remove: (scope, entryId) =>
      run({ act: "delete", scope, id: entryId }, () =>
        removeEntry(id, scope, entryId),
      ),
  };

  return (
    <ConversationContext value={conversation}>{children}</ConversationContext>
  );
}
