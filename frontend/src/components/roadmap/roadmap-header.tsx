import { ArrowLeftIcon } from "@/components/icons";
import Link from "next/link";

export default function RoadmapHeader() {
  return (
    <header className="v-roadmap-header">
      <div className="flex flex-col items-start">
        <Link href="/" className="v-back-link">
          <ArrowLeftIcon className="text-outline" />
          Go Back
        </Link>

        <h1 className="text-h3 md:text-h1 mt-0.75 font-bold md:mt-1">
          Roadmap
        </h1>
      </div>

      <Link href="/feedback/new" className="v-btn-accent">
        + Add Feedback
      </Link>
    </header>
  );
}
