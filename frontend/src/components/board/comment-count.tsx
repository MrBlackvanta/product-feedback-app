import { CommentsIcon } from "@/components/icons";

const SCALE = {
  md: "gap-1 text-body-3 md:gap-2 md:text-body-1",
  lg: "gap-1 text-body-3 lg:gap-2 lg:text-body-1",
};

export default function CommentCount({
  count,
  from = "md",
  className = "",
}: {
  count: number;
  from?: keyof typeof SCALE;
  className?: string;
}) {
  return (
    <p
      className={`tracking-heading flex items-center font-bold ${SCALE[from]} ${
        count === 0 ? "text-ink-muted" : "text-ink"
      } ${className}`}
    >
      <CommentsIcon className="text-outline" />
      {count}
      <span className="sr-only">{count === 1 ? " comment" : " comments"}</span>
    </p>
  );
}
