"use client";

import CommentItem from "./comment-item";
import { useConversation } from "./conversation";

export default function CommentList() {
  const { comments, count } = useConversation();

  return (
    <section aria-labelledby="comments" className="v-comments-card">
      <h2 id="comments" className="text-h3 font-bold">
        {`${count} ${count === 1 ? "Comment" : "Comments"}`}
      </h2>

      {comments.length === 0 ? (
        <p className="text-body-3 text-ink-muted md:text-body-2 mt-6 md:mt-7">
          No comments yet. Be the first to say what you think.
        </p>
      ) : (
        <ol className="v-comment-list">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </ol>
      )}
    </section>
  );
}
