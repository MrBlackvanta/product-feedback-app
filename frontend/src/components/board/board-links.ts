import { DEFAULT_SORT, type Category, type Sort } from "@/data";

export function boardHref(category: Category | null, sort: Sort) {
  const params = new URLSearchParams();

  if (category) params.set("category", category);
  if (sort !== DEFAULT_SORT) params.set("sort", sort);

  const query = params.toString();

  return query ? `/?${query}` : "/";
}
