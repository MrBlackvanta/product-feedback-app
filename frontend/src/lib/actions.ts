"use server";

import { updateTag } from "next/cache";
import { API_URL, FEEDBACK_TAG, feedbackTag } from "./api";

export async function castUpvote(id: number, delta: 1 | -1) {
  const response = await fetch(`${API_URL}/api/feedback/${id}/upvote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ delta }),
  });

  if (!response.ok) {
    throw new Error(`POST /api/feedback/${id}/upvote responded ${response.status}`);
  }

  updateTag(FEEDBACK_TAG);
  updateTag(feedbackTag(id));
}
