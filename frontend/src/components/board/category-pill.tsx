import { CATEGORY_LABEL, type Category } from "@/data";

export default function CategoryPill({ category }: { category: Category }) {
  return (
    <span className="v-pill bg-action-tint text-action">
      {CATEGORY_LABEL[category]}
    </span>
  );
}
