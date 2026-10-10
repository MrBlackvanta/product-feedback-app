import { SITE_URL } from "@/data";
import { getFeedback } from "@/lib";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requests = await getFeedback();

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/roadmap`, changeFrequency: "daily", priority: 0.8 },
    ...requests.map((request) => ({
      url: `${SITE_URL}/feedback/${request.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    {
      url: `${SITE_URL}/feedback/new`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
