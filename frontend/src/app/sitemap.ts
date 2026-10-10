import { SITE_URL } from "@/data";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/roadmap`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${SITE_URL}/feedback/new`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
