import {
  BoardShell,
  CategoryFilter,
  EmptyFeedback,
  FeedbackCard,
  RoadmapSummary,
  SortBar,
} from "@/components/board";
import { DEFAULT_SORT, isCategory, isSort, selectSuggestions } from "@/data";
import { getFeedback } from "@/lib";

type HomePageProps = {
  searchParams: Promise<{ category?: string; sort?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const category = isCategory(params.category) ? params.category : null;
  const sort = isSort(params.sort) ? params.sort : DEFAULT_SORT;

  const feedback = await getFeedback();
  const suggestions = selectSuggestions(feedback, category, sort);

  return (
    <BoardShell
      sidebar={
        <>
          <CategoryFilter active={category} sort={sort} />
          <RoadmapSummary feedback={feedback} />
        </>
      }
    >
      <SortBar count={suggestions.length} sort={sort} category={category} />

      <div className="v-board-results">
        {suggestions.length === 0 ? (
          <EmptyFeedback />
        ) : (
          <ol className="v-suggestion-list">
            {suggestions.map((item) => (
              <li key={item.id}>
                <FeedbackCard feedback={item} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </BoardShell>
  );
}
