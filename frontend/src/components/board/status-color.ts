import type { RoadmapStatus } from "@/data";

export const STATUS_BG: Record<RoadmapStatus, string> = {
  planned: "bg-status-planned",
  "in-progress": "bg-status-progress",
  live: "bg-status-live",
};
