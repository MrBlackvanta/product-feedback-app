"use client";

import { ArrowUpIcon } from "@/components/icons";
import { castUpvote } from "@/lib/actions";
import { hasUpvoted, setUpvoted, subscribeToUpvotes } from "@/lib/upvoted";
import { useOptimistic, useSyncExternalStore, useTransition } from "react";

type UpvoteButtonProps = {
  id: number;
  title: string;
  upvotes: number;
  className?: string;
};

export default function UpvoteButton({
  id,
  title,
  upvotes,
  className = "",
}: UpvoteButtonProps) {
  const mine = useSyncExternalStore(
    subscribeToUpvotes,
    () => hasUpvoted(id),
    () => false,
  );
  const [count, addOptimistic] = useOptimistic(
    upvotes,
    (current: number, delta: number) => current + delta,
  );
  const [, startTransition] = useTransition();

  function toggle() {
    const delta = mine ? -1 : 1;

    startTransition(async () => {
      addOptimistic(delta);
      setUpvoted(id, !mine);
      await castUpvote(id, delta);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mine}
      className={`v-upvote ${className}`}
    >
      <ArrowUpIcon />
      <span>{count}</span>
      <span className="sr-only">{` upvotes for ${title}`}</span>
    </button>
  );
}
