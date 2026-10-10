"use server";

import { updateTag } from "next/cache";
import { API_URL, FEEDBACK_TAG, feedbackTag } from "./api";

async function send(path: string, body: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`POST ${path} responded ${response.status}`);
  }

  return response;
}

function refresh(id: number) {
  updateTag(FEEDBACK_TAG);
  updateTag(feedbackTag(id));
}

export async function castUpvote(id: number, delta: 1 | -1) {
  await send(`/api/feedback/${id}/upvote`, { delta });
  refresh(id);
}

export async function postComment(id: number, content: string) {
  await send(`/api/feedback/${id}/comments`, { content });
  refresh(id);
}

export async function postReply(
  id: number,
  commentId: number,
  replyingTo: string,
  content: string,
) {
  await send(`/api/comments/${commentId}/replies`, { content, replyingTo });
  refresh(id);
}
