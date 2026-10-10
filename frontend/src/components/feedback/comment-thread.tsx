import type { User } from "@/data";
import type { ReactNode } from "react";
import ReplyControl from "./reply-control";
import UserAvatar from "./user-avatar";

type CommentThreadProps = {
  id: number;
  commentId: number;
  author: User;
  children: ReactNode;
};

export default function CommentThread({
  id,
  commentId,
  author,
  children,
}: CommentThreadProps) {
  return (
    <article className="v-comment">
      <UserAvatar user={author} className="v-comment-avatar" />

      <div className="v-comment-name">
        <p className="text-body-3 md:text-h4 tracking-heading font-bold">
          {author.name}
        </p>
        <p className="text-body-3 text-ink-muted md:text-h4">
          {`@${author.username}`}
        </p>
      </div>

      <ReplyControl
        id={id}
        commentId={commentId}
        replyingTo={author.username}
      />

      {children}
    </article>
  );
}
