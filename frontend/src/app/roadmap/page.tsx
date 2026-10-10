import {
  RoadmapColumn,
  RoadmapHeader,
  StatusTabs,
} from "@/components/roadmap";
import {
  DEFAULT_ROADMAP_STATUS,
  groupByStatus,
  isRoadmapStatus,
  openGraphBase,
  SITE_NAME,
  twitterBase,
} from "@/data";
import { getFeedback } from "@/lib";
import type { Metadata } from "next";

const title = `${SITE_NAME} | Roadmap`;
const description =
  "Track every planned, in-progress and live feature, with the upvotes and discussion behind each one.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/roadmap" },
  openGraph: { ...openGraphBase, url: "/roadmap", title, description },
  twitter: twitterBase,
};

type RoadmapPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function RoadmapPage({ searchParams }: RoadmapPageProps) {
  const params = await searchParams;
  const active = isRoadmapStatus(params.status)
    ? params.status
    : DEFAULT_ROADMAP_STATUS;

  const columns = groupByStatus(await getFeedback());

  return (
    <div className="v-roadmap">
      <RoadmapHeader />

      <StatusTabs active={active} columns={columns} />

      <main className="v-roadmap-columns">
        {columns.map(({ status, items }) => (
          <RoadmapColumn
            key={status}
            status={status}
            items={items}
            current={status === active}
          />
        ))}
      </main>
    </div>
  );
}
