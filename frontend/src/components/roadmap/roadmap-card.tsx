import {
  CategoryPill,
  CommentCount,
  STATUS_BG,
  UpvoteButton,
} from "@/components/board";
import { STATUS_LABEL, type RoadmapItem } from "@/data";
import Link from "next/link";

export default function RoadmapCard({ item }: { item: RoadmapItem }) {
  const { id, title, description, category, status, upvotes, commentCount } =
    item;

  return (
    <article className="v-roadmap-card">
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1.5 ${STATUS_BG[status]}`}
      />

      <p className="text-body-3 text-ink-muted lg:text-body-1 flex items-center gap-4 md:gap-6">
        <span
          aria-hidden="true"
          className={`size-2 shrink-0 rounded-full ${STATUS_BG[status]}`}
        />
        {STATUS_LABEL[status]}
      </p>

      <h3 className="text-body-3 lg:text-h3 tracking-heading mt-4 font-bold md:mt-3.5 lg:mt-2">
        <Link href={`/feedback/${id}`} className="v-card-link">
          {title}
        </Link>
      </h3>

      <p className="text-body-3 text-ink-muted lg:text-body-1 mt-2.25 lg:mt-1">
        {description}
      </p>

      <div className="mt-auto pt-2">
        <CategoryPill category={category} />

        <div className="mt-4 flex items-center justify-between">
          <UpvoteButton
            id={id}
            title={title}
            upvotes={upvotes}
            className="lg:h-10"
          />

          <CommentCount count={commentCount} from="lg" />
        </div>
      </div>
    </article>
  );
}
