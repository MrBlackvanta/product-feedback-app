import { SITE_NAME } from "@/data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Request not found`,
  robots: { index: false },
};

export default function FeedbackNotFound() {
  return (
    <main className="v-retry">
      <div className="v-empty">
        <h1 className="text-h3 md:text-h1 font-bold">
          That request isn&rsquo;t here.
        </h1>

        <p className="text-body-3 text-ink-muted md:text-body-1 mt-3.5 max-w-102.5 md:mt-4">
          It may have been merged into another one or taken down. The board has
          everything that is still open.
        </p>

        <Link href="/" className="v-btn-accent mt-6 md:mt-12">
          Go to the board
        </Link>
      </div>
    </main>
  );
}
