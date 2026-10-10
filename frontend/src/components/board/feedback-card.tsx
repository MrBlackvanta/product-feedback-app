import { type Feedback } from "@/data";
import Link from "next/link";
import CategoryPill from "./category-pill";
import CommentCount from "./comment-count";
import UpvoteButton from "./upvote-button";

type FeedbackCardProps = {
  feedback: Feedback;
  heading?: "h1" | "h3";
  linked?: boolean;
};

export default function FeedbackCard({
  feedback,
  heading: Heading = "h3",
  linked = true,
}: FeedbackCardProps) {
  const { id, title, description, category, upvotes, commentCount } = feedback;

  return (
    <article className="v-feedback-card">
      <UpvoteButton
        id={id}
        title={title}
        upvotes={upvotes}
        className="v-feedback-card-votes md:v-upvote-stacked"
      />

      <div className="v-feedback-card-body">
        <Heading className="text-body-3 md:text-h3 tracking-heading font-bold">
          {linked ? (
            <Link href={`/feedback/${id}`} className="v-card-link">
              {title}
            </Link>
          ) : (
            title
          )}
        </Heading>

        <p className="text-body-3 text-ink-muted md:text-body-1 mt-2.25 md:mt-1">
          {description}
        </p>

        <div className="mt-2 md:mt-3">
          <CategoryPill category={category} />
        </div>
      </div>

      <CommentCount count={commentCount} className="v-feedback-card-comments" />
    </article>
  );
}
