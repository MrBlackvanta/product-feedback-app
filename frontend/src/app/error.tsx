"use client";

export default function BoardError({ reset }: { reset: () => void }) {
  return (
    <main className="v-retry">
      <div className="v-empty">
        <h1 className="text-h3 md:text-h1 font-bold">
          We couldn&rsquo;t load the board.
        </h1>

        <p className="text-body-3 text-ink-muted md:text-body-1 mt-3.5 max-w-102.5 md:mt-4">
          The feedback service didn&rsquo;t answer. It may be waking up, so give
          it a moment and try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="v-btn-accent mt-6 md:mt-12"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
