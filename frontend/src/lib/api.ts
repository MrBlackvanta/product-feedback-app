import type { Feedback, FeedbackDetail, User } from "@/data";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5181";

export const FEEDBACK_TAG = "feedback";

export const feedbackTag = (id: number) => `feedback-${id}`;

async function read<T>(path: string, tags: string[]): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    next: { tags, revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`GET ${path} responded ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const getFeedback = () => read<Feedback[]>("/api/feedback", [FEEDBACK_TAG]);

export const getFeedbackDetail = (id: number) =>
  read<FeedbackDetail>(`/api/feedback/${id}`, [FEEDBACK_TAG, feedbackTag(id)]);

export const getCurrentUser = () => read<User>("/api/me", ["me"]);
