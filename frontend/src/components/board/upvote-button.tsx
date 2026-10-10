"use client";

import { ArrowUpIcon } from "@/components/icons";
import { castUpvote } from "@/lib/actions";
import { hasUpvoted, setUpvoted, subscribeToUpvotes } from "@/lib/upvoted";
import {
  useOptimistic,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";

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
  const [roll, setRoll] = useState<"up" | "down">();

  function toggle() {
    const delta = mine ? -1 : 1;

    setRoll(delta > 0 ? "up" : "down");

    startTransition(async () => {
      addOptimistic(delta);
      setUpvoted(id, !mine);

      try {
        await castUpvote(id, delta);
      } catch {
        setUpvoted(id, mine);
      }
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
      <span data-roll={roll} className="v-upvote-count">
        <span key={count}>{count}</span>
      </span>
      <span className="sr-only">{` upvotes for ${title}`}</span>
    </button>
  );
}
