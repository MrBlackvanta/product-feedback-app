import { SITE_URL } from "@/data";
import { beforeEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

const { getFeedback } = vi.hoisted(() => ({ getFeedback: vi.fn() }));

vi.mock("@/lib", () => ({ getFeedback }));

beforeEach(() => {
  getFeedback.mockResolvedValue([{ id: 4 }, { id: 11 }]);
});

describe("robots", () => {
  it("points crawlers at the sitemap on this origin", () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("allows the whole site, so the CSS, fonts and images stay crawlable", () => {
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" });
  });
});

describe("sitemap", () => {
  it("lists every entry on this origin", async () => {
    for (const entry of await sitemap()) {
      expect(new URL(entry.url).origin).toBe(new URL(SITE_URL).origin);
    }
  });

  it("lists each route once", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });

  it("includes the home page", async () => {
    expect((await sitemap()).map((entry) => entry.url)).toContain(SITE_URL);
  });

  it("lists a page for every request on the board", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain(`${SITE_URL}/feedback/4`);
    expect(urls).toContain(`${SITE_URL}/feedback/11`);
  });

  it("ranks a request above the form that creates one", async () => {
    const entries = await sitemap();
    const detail = entries.find((entry) => entry.url.endsWith("/feedback/4"));
    const form = entries.find((entry) => entry.url.endsWith("/feedback/new"));

    expect(detail?.priority).toBeGreaterThan(form!.priority!);
  });
});
