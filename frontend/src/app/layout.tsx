import { RouteTransitions } from "@/components/effects";
import { Signature } from "@/components/layout";
import { SITE_NAME, SITE_URL, openGraphBase, twitterBase } from "@/data";
import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const title = `${SITE_NAME} | Feedback Board`;
const description =
  "Share product ideas, upvote what you want built next, and follow every request from suggestion to live on the public roadmap.";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { ...openGraphBase, url: "/" },
  twitter: twitterBase,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#a337f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable} antialiased`}>
      <body className="relative min-h-dvh">
        <Suspense>
          <RouteTransitions />
        </Suspense>

        {children}

        <Signature />
      </body>
    </html>
  );
}
