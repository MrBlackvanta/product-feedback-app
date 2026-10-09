import { SITE_URL } from "@/data";
import { describe, expect, it } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("robots", () => {
  it("points crawlers at the sitemap on this origin", () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("allows the whole site, so the CSS, fonts and images stay crawlable", () => {
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" });
  });
});

describe("sitemap", () => {
  it("lists every entry on this origin", () => {
    for (const entry of sitemap()) {
      expect(new URL(entry.url).origin).toBe(new URL(SITE_URL).origin);
    }
  });

  it("lists each route once", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });

  it("includes the home page", () => {
    expect(sitemap().map((entry) => entry.url)).toContain(SITE_URL);
  });
});
