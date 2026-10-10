import { ArrowLeftIcon } from "@/components/icons";
import Link from "next/link";

export default function DetailHeader({ id }: { id: number }) {
  return (
    <header className="v-detail-bar">
      <Link href="/" className="v-back-link text-ink-muted">
        <ArrowLeftIcon className="text-action" />
        Go Back
      </Link>

      <Link href={`/feedback/${id}/edit`} className="v-btn-action">
        Edit Feedback
      </Link>
    </header>
  );
}
