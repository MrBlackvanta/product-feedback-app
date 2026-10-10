import type { Feedback, FeedbackDetail, User } from "@/data";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5181";

const FRESH: RequestInit = { cache: "no-store" };

const SEEDED: RequestInit = { next: { revalidate: 3600 } };

async function read<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);

  if (!response.ok) {
    throw new Error(`GET ${path} responded ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const getFeedback = () => read<Feedback[]>("/api/feedback", FRESH);

export const getCurrentUser = () => read<User>("/api/me", SEEDED);

export async function getFeedbackDetail(id: number) {
  const path = `/api/feedback/${id}`;
  const response = await fetch(`${API_URL}${path}`, FRESH);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GET ${path} responded ${response.status}`);
  }

  return response.json() as Promise<FeedbackDetail>;
}
