import CommentThread from "./comment-thread";
import type { Thread } from "./conversation";

export default function CommentItem({ comment }: { comment: Thread }) {
  return (
    <li>
      <CommentThread
        scope="comment"
        id={comment.id}
        commentId={comment.id}
        author={comment.author}
        content={comment.content}
        pending={comment.pending}
        trouble={comment.trouble}
      />

      {comment.replies.length > 0 && (
        <ol className="v-replies">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentThread
                scope="reply"
                id={reply.id}
                commentId={comment.id}
                author={reply.author}
                content={reply.content}
                replyingTo={reply.replyingTo}
                pending={reply.pending}
                trouble={reply.trouble}
              />
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}
