"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const COMMIT_TIMEOUT = 1000;
const MORPH_NAME = "v-feedback-card";
const FEEDBACK_PATH = /^\/feedback\/(\d+)\/?$/;

type PendingCommit = {
  resolve: () => void;
  card: string | null;
};

function morphingCard(destination: string) {
  return (
    FEEDBACK_PATH.exec(destination)?.[1] ??
    FEEDBACK_PATH.exec(location.pathname)?.[1] ??
    null
  );
}

function nameCard(id: string) {
  const card = document.querySelector<HTMLElement>(`[data-vt-card="${id}"]`);

  card?.style.setProperty("view-transition-name", MORPH_NAME);

  return Boolean(card);
}

function clearNames() {
  for (const card of document.querySelectorAll<HTMLElement>("[data-vt-card]")) {
    card.style.removeProperty("view-transition-name");
  }
}

export default function RouteTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const commit = useRef<PendingCommit | null>(null);

  useEffect(() => {
    const pending = commit.current;

    if (!pending) return;

    commit.current = null;

    if (pending.card) nameCard(pending.card);

    pending.resolve();
  }, [pathname, query]);

  useEffect(() => {
    if (!("startViewTransition" in document)) return;

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;

      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target || link.hasAttribute("download")) return;
      if (link.origin !== location.origin) return;
      if (
        link.pathname === location.pathname &&
        link.search === location.search
      ) {
        return;
      }

      event.preventDefault();
      commit.current?.resolve();

      const destination = link.pathname + link.search + link.hash;
      const card = morphingCard(link.pathname);
      const paired = card !== null && nameCard(card);

      const transition = document.startViewTransition(() => {
        const committed = new Promise<void>((resolve) => {
          commit.current = { resolve, card: paired ? card : null };
        });

        router.push(destination);

        return Promise.race([
          committed,
          new Promise<void>((give) => setTimeout(give, COMMIT_TIMEOUT)),
        ]);
      });

      transition.ready.catch(() => {});
      transition.finished.finally(clearNames);
    }

    document.addEventListener("click", handleClick, true);

    return () => document.removeEventListener("click", handleClick, true);
  }, [router]);

  return null;
}
