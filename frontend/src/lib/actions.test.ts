import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteFeedback, removeEntry } from "./actions";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const went = vi.mocked(redirect);

function answers(status: number) {
  const calls = vi.fn<typeof fetch>(async () => new Response(null, { status }));

  vi.stubGlobal("fetch", calls);

  return calls;
}

beforeEach(() => {
  went.mockReset();
});

describe("deleteFeedback", () => {
  it("sends the board back home once the request is gone", async () => {
    answers(204);

    await deleteFeedback(13);

    expect(went).toHaveBeenCalledWith("/");
  });

  it("treats a request that is already gone as deleted", async () => {
    answers(404);

    await deleteFeedback(13);

    expect(went).toHaveBeenCalledWith("/");
  });

  it("refuses to pretend a failed delete worked", async () => {
    answers(500);

    await expect(deleteFeedback(13)).rejects.toThrow(/responded 500/);
    expect(went).not.toHaveBeenCalled();
  });
});

describe("removeEntry", () => {
  it("treats a comment that is already gone as deleted", async () => {
    const calls = answers(404);

    await expect(removeEntry("comment", 4)).resolves.toBeUndefined();
    expect(calls.mock.calls[0]?.[1]).toMatchObject({ method: "DELETE" });
  });
});
