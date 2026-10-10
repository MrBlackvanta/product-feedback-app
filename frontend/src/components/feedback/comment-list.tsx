import type { Comment } from "@/data";
import CommentItem from "./comment-item";

type CommentListProps = {
  id: number;
  count: number;
  comments: Comment[];
};

export default function CommentList({ id, count, comments }: CommentListProps) {
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
            <CommentItem key={comment.id} id={id} comment={comment} />
          ))}
        </ol>
      )}
    </section>
  );
}
