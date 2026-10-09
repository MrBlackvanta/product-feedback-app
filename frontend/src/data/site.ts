import type { Metadata } from "next";

export const SITE_URL =
  "https://product-feedback-app.abdelrhman-ahmed8881.workers.dev";

export const SITE_NAME = "Townhall";

const shareImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "A feedback board listing product requests with their upvote counts, categories and comment totals.",
};

export const openGraphBase = {
  siteName: SITE_NAME,
  locale: "en_US",
  type: "website",
  images: [shareImage],
} satisfies Metadata["openGraph"];

export const twitterBase = {
  card: "summary_large_image",
  images: [shareImage],
} satisfies Metadata["twitter"];
