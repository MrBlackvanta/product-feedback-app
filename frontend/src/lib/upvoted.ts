const KEY = "townhall:upvoted";
const listeners = new Set<() => void>();

let ids: Set<number> | null = null;

function load() {
  if (!ids) {
    try {
      ids = new Set<number>(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch {
      ids = new Set<number>();
    }
  }

  return ids;
}

function announce() {
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== KEY) return;
    ids = null;
    announce();
  });
}

export function subscribeToUpvotes(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function hasUpvoted(id: number) {
  return load().has(id);
}

export function setUpvoted(id: number, upvoted: boolean) {
  const current = load();

  if (upvoted) current.add(id);
  else current.delete(id);

  try {
    localStorage.setItem(KEY, JSON.stringify([...current]));
  } catch {
    // A private window with storage blocked still gets the optimistic count.
  }

  announce();
}
