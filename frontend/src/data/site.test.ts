import { describe, expect, it } from "vitest";
import { SITE_URL, openGraphBase, twitterBase } from "./site";

describe("SITE_URL", () => {
  it("is an https origin with no trailing slash", () => {
    const url = new URL(SITE_URL);

    expect(url.protocol).toBe("https:");
    expect(url.pathname).toBe("/");
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("resolves a root-relative path without doubling or losing a segment", () => {
    expect(new URL("/sitemap.xml", SITE_URL).href).toBe(
      `${SITE_URL}/sitemap.xml`,
    );
  });
});

describe("share metadata", () => {
  it("names a same-origin card so a scraper is not sent cross-origin", () => {
    const [image] = openGraphBase.images;

    expect(image.url.startsWith("/")).toBe(true);
    expect(new URL(image.url, SITE_URL).origin).toBe(new URL(SITE_URL).origin);
  });

  it("declares neither a title nor a description, so each route shares as itself", () => {
    expect(openGraphBase).not.toHaveProperty("title");
    expect(openGraphBase).not.toHaveProperty("description");
    expect(twitterBase).not.toHaveProperty("title");
    expect(twitterBase).not.toHaveProperty("description");
  });

  it("keeps the source of the design out of anything a visitor reads", () => {
    const visible = [openGraphBase.siteName, openGraphBase.images[0].alt].join(
      " ",
    );

    expect(visible).not.toMatch(/frontend mentor|challenge/i);
  });
});
