import {
  ROADMAP_STATUSES,
  STATUS_LABEL,
  type Feedback,
  type RoadmapStatus,
} from "@/data";
import Link from "next/link";

const DOT: Record<RoadmapStatus, string> = {
  planned: "bg-status-planned",
  "in-progress": "bg-status-progress",
  live: "bg-status-live",
};

export default function RoadmapSummary({ feedback }: { feedback: Feedback[] }) {
  return (
    <section
      aria-labelledby="roadmap-summary"
      className="v-card px-6 pt-4.75 pb-6"
    >
      <div className="flex items-center justify-between">
        <h2 id="roadmap-summary" className="text-h3 font-bold">
          Roadmap
        </h2>

        <Link
          href="/roadmap"
          className="v-focus-ring text-body-3 text-action hover:text-action-hover font-semibold underline"
        >
          View<span className="sr-only"> the roadmap</span>
        </Link>
      </div>

      <ul className="mt-6 space-y-2">
        {ROADMAP_STATUSES.map((status) => (
          <li key={status} className="text-body-1 flex items-center">
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${DOT[status]}`}
            />
            <span className="text-ink-muted ml-4">{STATUS_LABEL[status]}</span>
            <span className="text-ink-muted ml-auto font-bold">
              {feedback.filter((item) => item.status === status).length}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
