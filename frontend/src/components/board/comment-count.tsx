import { CommentsIcon } from "@/components/icons";

export default function CommentCount({
  count,
  className = "",
}: {
  count: number;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-1 text-body-3 font-bold md:gap-2 md:text-body-1 ${
        count === 0 ? "text-ink-muted" : "text-ink"
      } ${className}`}
    >
      <CommentsIcon className="text-outline" />
      {count}
      <span className="sr-only">{count === 1 ? " comment" : " comments"}</span>
    </p>
  );
}
