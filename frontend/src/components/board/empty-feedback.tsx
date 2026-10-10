import illustration from "@/assets/illustration-empty.svg";
import Image from "next/image";
import Link from "next/link";

export default function EmptyFeedback() {
  return (
    <div className="v-empty">
      <Image src={illustration} alt="" className="h-auto w-25.5 md:w-32.5" />

      <h3 className="text-h3 md:text-h1 mt-9.75 font-bold md:mt-13.25">
        There is no feedback yet.
      </h3>

      <p className="text-body-3 text-ink-muted md:text-body-1 mt-3.5 max-w-102.5 md:mt-4">
        Got a suggestion? Found a bug that needs to be squashed? We love hearing
        about new ideas to improve our app.
      </p>

      <Link href="/feedback/new" className="v-btn-accent mt-6 md:mt-12">
        + Add Feedback
      </Link>
    </div>
  );
}
