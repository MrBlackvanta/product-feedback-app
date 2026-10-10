"use server";

import { isCategory, type Category } from "@/data";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
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

export async function createFeedback(
  title: string,
  category: Category,
  description: string,
) {
  if (!title || !description || !isCategory(category)) {
    throw new Error("createFeedback received an incomplete request");
  }

  const response = await send("/api/feedback", {
    title,
    category,
    description,
  });
  const created = (await response.json()) as { id: number };

  updateTag(FEEDBACK_TAG);
  redirect(`/feedback/${created.id}`);
}
