import { SuggestionsIcon } from "@/components/icons";
import type { Category, Sort } from "@/data";
import Link from "next/link";
import SortMenu from "./sort-menu";

type SortBarProps = {
  count: number;
  sort: Sort;
  category: Category | null;
};

export default function SortBar({ count, sort, category }: SortBarProps) {
  return (
    <div className="v-sort-bar">
      <SuggestionsIcon className="hidden shrink-0 md:block" />

      <h2 className="text-h3 sr-only font-bold md:not-sr-only md:mr-9.5 md:ml-2">
        {count} {count === 1 ? "Suggestion" : "Suggestions"}
      </h2>

      <SortMenu sort={sort} category={category} />

      <Link href="/feedback/new" className="v-btn-accent ml-auto">
        + Add Feedback
      </Link>
    </div>
  );
}
