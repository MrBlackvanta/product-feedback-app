import { FeedbackCard } from "@/components/board";
import { AddComment, CommentList, DetailHeader } from "@/components/feedback";
import { openGraphBase, parseFeedbackId, SITE_NAME, twitterBase } from "@/data";
import { getFeedbackDetail } from "@/lib";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

async function load(params: DetailPageProps["params"]) {
  const id = parseFeedbackId((await params).id);

  return id === null ? null : getFeedbackDetail(id);
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const detail = await load(params);

  if (!detail) {
    return {
      title: `${SITE_NAME} | Request not found`,
      robots: { index: false },
    };
  }

  const title = `${SITE_NAME} | ${detail.title}`;
  const url = `/feedback/${detail.id}`;

  return {
    title,
    description: detail.description,
    alternates: { canonical: url },
    openGraph: {
      ...openGraphBase,
      url,
      title,
      description: detail.description,
    },
    twitter: twitterBase,
  };
}

export default async function FeedbackDetailPage({ params }: DetailPageProps) {
  const detail = await load(params);

  if (!detail) {
    notFound();
  }

  return (
    <main className="v-detail">
      <DetailHeader id={detail.id} />

      <FeedbackCard feedback={detail} heading="h1" linked={false} />

      <CommentList
        id={detail.id}
        count={detail.commentCount}
        comments={detail.comments}
      />

      <AddComment id={detail.id} />
    </main>
  );
}
