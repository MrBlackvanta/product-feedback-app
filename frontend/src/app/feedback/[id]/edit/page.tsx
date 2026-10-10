import { EditFeedbackForm } from "@/components/feedback";
import { ArrowLeftIcon } from "@/components/icons";
import { openGraphBase, parseFeedbackId, SITE_NAME, twitterBase } from "@/data";
import { getFeedbackDetail } from "@/lib";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

async function load(params: EditPageProps["params"]) {
  const id = parseFeedbackId((await params).id);

  return id === null ? null : getFeedbackDetail(id);
}

export async function generateMetadata({
  params,
}: EditPageProps): Promise<Metadata> {
  const detail = await load(params);

  if (!detail) {
    return {
      title: `${SITE_NAME} | Request not found`,
      robots: { index: false },
    };
  }

  const title = `${SITE_NAME} | Editing ‘${detail.title}’`;
  const description = `Update the title, category, status or detail of ‘${detail.title}’.`;

  return {
    title,
    description,
    alternates: { canonical: `/feedback/${detail.id}` },
    openGraph: {
      ...openGraphBase,
      url: `/feedback/${detail.id}/edit`,
      title,
      description,
    },
    twitter: twitterBase,
  };
}

export default async function EditFeedbackPage({ params }: EditPageProps) {
  const detail = await load(params);

  if (!detail) {
    notFound();
  }

  return (
    <main className="v-form-page">
      <div className="flex">
        <Link
          href={`/feedback/${detail.id}`}
          className="v-back-link text-ink-muted"
        >
          <ArrowLeftIcon className="text-action" />
          Go Back
        </Link>
      </div>

      <EditFeedbackForm
        feedback={{
          id: detail.id,
          title: detail.title,
          category: detail.category,
          status: detail.status,
          description: detail.description,
        }}
      />
    </main>
  );
}
