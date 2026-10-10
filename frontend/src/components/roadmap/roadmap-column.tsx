import { STATUS_BLURB, STATUS_LABEL, type RoadmapItem } from "@/data";
import type { RoadmapStatus } from "@/data";
import RoadmapCard from "./roadmap-card";

type RoadmapColumnProps = {
  status: RoadmapStatus;
  items: RoadmapItem[];
  current: boolean;
};

export default function RoadmapColumn({
  status,
  items,
  current,
}: RoadmapColumnProps) {
  return (
    <section
      aria-labelledby={`roadmap-${status}`}
      className={current ? undefined : "hidden md:block"}
    >
      <h2
        id={`roadmap-${status}`}
        className="text-h3 md:text-h4 lg:text-h3 tracking-heading font-bold"
      >
        {STATUS_LABEL[status]} ({items.length})
      </h2>

      <p className="text-body-3 text-ink-muted md:text-h4 lg:text-body-1 mt-1">
        {STATUS_BLURB[status]}
      </p>

      <ol className="mt-6 space-y-4 lg:mt-8 lg:space-y-6">
        {items.map((item) => (
          <li key={item.id}>
            <RoadmapCard item={item} />
          </li>
        ))}
      </ol>
    </section>
  );
}
