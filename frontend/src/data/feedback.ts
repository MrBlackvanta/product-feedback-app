export const CATEGORIES = [
  "ui",
  "ux",
  "enhancement",
  "bug",
  "feature",
] as const;
export const ROADMAP_STATUSES = ["planned", "in-progress", "live"] as const;
export const SORTS = [
  "most-upvotes",
  "least-upvotes",
  "most-comments",
  "least-comments",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];
export type Status = "suggestion" | RoadmapStatus;
export type Sort = (typeof SORTS)[number];

export const CATEGORY_CHOICES = [
  "feature",
  "ui",
  "ux",
  "enhancement",
  "bug",
] as const satisfies readonly Category[];

export const CATEGORY_LABEL: Record<Category, string> = {
  ui: "UI",
  ux: "UX",
  enhancement: "Enhancement",
  bug: "Bug",
  feature: "Feature",
};

export const STATUS_LABEL: Record<RoadmapStatus, string> = {
  planned: "Planned",
  "in-progress": "In-Progress",
  live: "Live",
};

export const STATUS_BLURB: Record<RoadmapStatus, string> = {
  planned: "Ideas prioritized for research",
  "in-progress": "Currently being developed",
  live: "Released features",
};

export const SORT_LABEL: Record<Sort, string> = {
  "most-upvotes": "Most Upvotes",
  "least-upvotes": "Least Upvotes",
  "most-comments": "Most Comments",
  "least-comments": "Least Comments",
};

export const DEFAULT_SORT: Sort = "most-upvotes";

export const DEFAULT_CATEGORY: Category = "feature";

export const DEFAULT_ROADMAP_STATUS: RoadmapStatus = "in-progress";

export type User = {
  name: string;
  username: string;
  avatar: string;
};

export type Feedback = {
  id: number;
  title: string;
  category: Category;
  status: Status;
  upvotes: number;
  description: string;
  commentCount: number;
};

export type Reply = {
  id: number;
  replyingTo: string;
  content: string;
  author: User;
};

export type Comment = {
  id: number;
  content: string;
  author: User;
  replies: Reply[];
};

export type FeedbackDetail = Feedback & { comments: Comment[] };

export type RoadmapItem = Feedback & { status: RoadmapStatus };

export function isCategory(value: unknown): value is Category {
  return CATEGORIES.includes(value as Category);
}

export function isSort(value: unknown): value is Sort {
  return SORTS.includes(value as Sort);
}

export function parseFeedbackId(raw: string) {
  return /^[1-9]\d*$/.test(raw) ? Number(raw) : null;
}

export function isRoadmapStatus(value: unknown): value is RoadmapStatus {
  return ROADMAP_STATUSES.includes(value as RoadmapStatus);
}

const COMPARE: Record<Sort, (a: Feedback, b: Feedback) => number> = {
  "most-upvotes": (a, b) => b.upvotes - a.upvotes,
  "least-upvotes": (a, b) => a.upvotes - b.upvotes,
  "most-comments": (a, b) => b.commentCount - a.commentCount,
  "least-comments": (a, b) => a.commentCount - b.commentCount,
};

export function selectSuggestions(
  feedback: Feedback[],
  category: Category | null,
  sort: Sort,
) {
  return feedback
    .filter((item) => item.status === "suggestion")
    .filter((item) => !category || item.category === category)
    .sort(COMPARE[sort]);
}

export function groupByStatus(feedback: Feedback[]) {
  return ROADMAP_STATUSES.map((status) => ({
    status,
    items: feedback
      .filter((item): item is RoadmapItem => item.status === status)
      .sort(COMPARE[DEFAULT_SORT]),
  }));
}
