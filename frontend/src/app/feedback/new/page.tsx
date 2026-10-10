import { NewFeedbackForm } from "@/components/feedback";
import { ArrowLeftIcon } from "@/components/icons";
import { openGraphBase, SITE_NAME, twitterBase } from "@/data";
import type { Metadata } from "next";
import Link from "next/link";

const title = `${SITE_NAME} | Create New Feedback`;
const description =
  "Ask for a feature, report a bug or suggest an improvement, and let everyone else upvote it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/feedback/new" },
  openGraph: { ...openGraphBase, url: "/feedback/new", title, description },
  twitter: twitterBase,
};

export default function NewFeedbackPage() {
  return (
    <main className="v-form-page">
      <div className="flex">
        <Link href="/" className="v-back-link text-ink-muted">
          <ArrowLeftIcon className="text-action" />
          Go Back
        </Link>
      </div>

      <NewFeedbackForm />
    </main>
  );
}
