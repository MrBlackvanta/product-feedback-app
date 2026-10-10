import type { Comment } from "@/data";
import CommentThread from "./comment-thread";

export default function CommentItem({
  id,
  comment,
}: {
  id: number;
  comment: Comment;
}) {
  return (
    <li>
      <CommentThread id={id} commentId={comment.id} author={comment.author}>
        <p className="v-comment-body">{comment.content}</p>
      </CommentThread>

      {comment.replies.length > 0 && (
        <ol className="v-replies">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentThread
                id={id}
                commentId={comment.id}
                author={reply.author}
              >
                <p className="v-comment-body">
                  <span className="text-accent font-bold">
                    {`@${reply.replyingTo}`}
                  </span>{" "}
                  {reply.content}
                </p>
              </CommentThread>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}
