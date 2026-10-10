import type { Feedback, FeedbackDetail, User } from "@/data";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5181";

export const FEEDBACK_TAG = "feedback";

export const feedbackTag = (id: number) => `feedback-${id}`;

const cached = (tags: string[]) => ({ next: { tags, revalidate: 60 } });

async function read<T>(path: string, tags: string[]): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, cached(tags));

  if (!response.ok) {
    throw new Error(`GET ${path} responded ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const getFeedback = () =>
  read<Feedback[]>("/api/feedback", [FEEDBACK_TAG]);

export const getCurrentUser = () => read<User>("/api/me", ["me"]);

export async function getFeedbackDetail(id: number) {
  const path = `/api/feedback/${id}`;
  const response = await fetch(
    `${API_URL}${path}`,
    cached([FEEDBACK_TAG, feedbackTag(id)]),
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GET ${path} responded ${response.status}`);
  }

  return response.json() as Promise<FeedbackDetail>;
}
