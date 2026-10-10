import {
  DEFAULT_ROADMAP_STATUS,
  STATUS_LABEL,
  type groupByStatus,
  type RoadmapStatus,
} from "@/data";
import Link from "next/link";

type StatusTabsProps = {
  active: RoadmapStatus;
  columns: ReturnType<typeof groupByStatus>;
};

export default function StatusTabs({ active, columns }: StatusTabsProps) {
  return (
    <nav aria-label="Roadmap columns" className="v-status-tabs">
      {columns.map(({ status, items }) => (
        <Link
          key={status}
          href={
            status === DEFAULT_ROADMAP_STATUS
              ? "/roadmap"
              : `/roadmap?status=${status}`
          }
          aria-current={status === active ? "true" : undefined}
          className="v-status-tab"
        >
          {STATUS_LABEL[status]} ({items.length})
        </Link>
      ))}
    </nav>
  );
}
