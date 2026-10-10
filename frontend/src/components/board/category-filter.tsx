import { CATEGORIES, CATEGORY_LABEL, type Category, type Sort } from "@/data";
import Link from "next/link";
import { boardHref } from "./board-links";

type CategoryFilterProps = {
  active: Category | null;
  sort: Sort;
};

export default function CategoryFilter({ active, sort }: CategoryFilterProps) {
  const options: Array<{ value: Category | null; label: string }> = [
    { value: null, label: "All" },
    ...CATEGORIES.map((value) => ({ value, label: CATEGORY_LABEL[value] })),
  ];

  return (
    <nav aria-label="Filter suggestions by category" className="v-card p-6">
      <ul className="flex flex-wrap gap-x-2 gap-y-3.5">
        {options.map(({ value, label }) => {
          const selected = value === active;

          return (
            <li key={label}>
              <Link
                href={boardHref(value, sort)}
                aria-current={selected ? "page" : undefined}
                className={`v-pill v-focus-ring ${
                  selected
                    ? "bg-action text-white"
                    : "bg-action-tint text-action hover:bg-action-tint-hover"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
