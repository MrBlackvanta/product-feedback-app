"use server";

import { isCategory, isStatus, type Category, type Status } from "@/data";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL, FEEDBACK_TAG, feedbackTag } from "./api";

async function send(method: string, path: string, body?: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${method} ${path} responded ${response.status}`);
  }

  return response;
}

function refresh(id: number) {
  updateTag(FEEDBACK_TAG);
  updateTag(feedbackTag(id));
}

export async function castUpvote(id: number, delta: 1 | -1) {
  await send("POST", `/api/feedback/${id}/upvote`, { delta });
  refresh(id);
}

export async function postComment(id: number, content: string) {
  await send("POST", `/api/feedback/${id}/comments`, { content });
  refresh(id);
}

export async function postReply(
  id: number,
  commentId: number,
  replyingTo: string,
  content: string,
) {
  await send("POST", `/api/comments/${commentId}/replies`, {
    content,
    replyingTo,
  });
  refresh(id);
}

const ENTRY_PATH = { comment: "comments", reply: "replies" } as const;

export type EntryScope = keyof typeof ENTRY_PATH;

function entryPath(scope: EntryScope, entryId: number) {
  const segment = ENTRY_PATH[scope];

  if (!segment || !Number.isSafeInteger(entryId)) {
    throw new Error("The request named an entry that cannot exist");
  }

  return `/api/${segment}/${entryId}`;
}

export async function editEntry(
  id: number,
  scope: EntryScope,
  entryId: number,
  content: string,
) {
  await send("PATCH", entryPath(scope, entryId), { content });
  refresh(id);
}

export async function removeEntry(
  id: number,
  scope: EntryScope,
  entryId: number,
) {
  await send("DELETE", entryPath(scope, entryId));
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

  const response = await send("POST", "/api/feedback", {
    title,
    category,
    description,
  });
  const created = (await response.json()) as { id: number };

  updateTag(FEEDBACK_TAG);
  redirect(`/feedback/${created.id}`);
}

export async function updateFeedback(
  id: number,
  title: string,
  category: Category,
  status: Status,
  description: string,
) {
  if (!title || !description || !isCategory(category) || !isStatus(status)) {
    throw new Error("updateFeedback received an incomplete request");
  }

  await send("PATCH", `/api/feedback/${id}`, {
    title,
    category,
    status,
    description,
  });

  refresh(id);
  redirect(`/feedback/${id}`);
}

export async function deleteFeedback(id: number) {
  await send("DELETE", `/api/feedback/${id}`);

  refresh(id);
  redirect("/");
}
