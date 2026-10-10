"use server";

import { isCategory, isStatus, type Category, type Status } from "@/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { API_URL } from "./api";

const ALREADY_GONE = 404;

function refreshEveryView() {
  revalidatePath("/", "layout");
}

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

async function sendDelete(path: string) {
  const response = await fetch(`${API_URL}${path}`, { method: "DELETE" });

  if (!response.ok && response.status !== ALREADY_GONE) {
    throw new Error(`DELETE ${path} responded ${response.status}`);
  }
}

export async function castUpvote(id: number, delta: 1 | -1) {
  await send("POST", `/api/feedback/${id}/upvote`, { delta });

  refreshEveryView();
}

export async function postComment(id: number, content: string) {
  await send("POST", `/api/feedback/${id}/comments`, { content });

  refreshEveryView();
}

export async function postReply(
  commentId: number,
  replyingTo: string,
  content: string,
) {
  await send("POST", `/api/comments/${commentId}/replies`, {
    content,
    replyingTo,
  });

  refreshEveryView();
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
  scope: EntryScope,
  entryId: number,
  content: string,
) {
  await send("PATCH", entryPath(scope, entryId), { content });

  refreshEveryView();
}

export async function removeEntry(scope: EntryScope, entryId: number) {
  await sendDelete(entryPath(scope, entryId));

  refreshEveryView();
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

  redirect(`/feedback/${id}`);
}

export async function deleteFeedback(id: number) {
  await sendDelete(`/api/feedback/${id}`);

  redirect("/");
}
