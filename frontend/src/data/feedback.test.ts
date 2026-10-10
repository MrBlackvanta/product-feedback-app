import { describe, expect, it } from "vitest";
import {
  groupByStatus,
  parseFeedbackId,
  selectSuggestions,
  type Category,
  type Feedback,
  type Sort,
  type Status,
} from "./feedback";

function entry(
  id: number,
  category: Category,
  status: Status,
  upvotes: number,
  commentCount: number,
): Feedback {
  return {
    id,
    title: `Request ${id}`,
    category,
    status,
    upvotes,
    description: "",
    commentCount,
  };
}

const BOARD: Feedback[] = [
  entry(1, "feature", "suggestion", 10, 2),
  entry(2, "ui", "suggestion", 99, 0),
  entry(3, "feature", "suggestion", 10, 5),
  entry(4, "bug", "planned", 50, 1),
  entry(5, "ux", "in-progress", 70, 4),
  entry(6, "enhancement", "live", 60, 3),
  entry(7, "enhancement", "live", 80, 1),
];

const ids = (items: { id: number }[]) => items.map((item) => item.id);

describe("parseFeedbackId", () => {
  it.each([
    ["1", 1],
    ["2", 2],
    ["12", 12],
    ["9007199254740991", 9007199254740991],
  ])("accepts %s", (raw, expected) => {
    expect(parseFeedbackId(raw)).toBe(expected);
  });

  it.each([
    ["", "empty"],
    ["abc", "not a number"],
    ["0", "zero is not an id"],
    ["-1", "negative"],
    ["2.5", "fractional"],
    [" 2 ", "padded, which Number() would silently accept"],
    ["1e3", "exponent form, which Number() would silently accept"],
    ["0x2", "hex form, which Number() would silently accept"],
    ["02", "leading zero, a second URL for the same request"],
    ["+2", "signed, a second URL for the same request"],
    ["Infinity", "not finite"],
  ])("rejects %j because it is %s", (raw) => {
    expect(parseFeedbackId(raw)).toBeNull();
  });
});

describe("selectSuggestions", () => {
  it("leaves everything that already reached the roadmap off the board", () => {
    expect(ids(selectSuggestions(BOARD, null, "most-upvotes"))).toEqual([
      2, 1, 3,
    ]);
  });

  it("narrows to one category without reaching past the suggestions", () => {
    expect(ids(selectSuggestions(BOARD, "feature", "most-upvotes"))).toEqual([
      1, 3,
    ]);
    expect(selectSuggestions(BOARD, "bug", "most-upvotes")).toEqual([]);
  });

  it.each<[Sort, number[]]>([
    ["most-upvotes", [2, 1, 3]],
    ["least-upvotes", [1, 3, 2]],
    ["most-comments", [3, 1, 2]],
    ["least-comments", [2, 1, 3]],
  ])("orders by %s", (sort, expected) => {
    expect(ids(selectSuggestions(BOARD, null, sort))).toEqual(expected);
  });

  it("keeps tied requests in the order the API sent them", () => {
    const tied = selectSuggestions(BOARD, null, "most-upvotes").filter(
      (item) => item.upvotes === 10,
    );

    expect(ids(tied)).toEqual([1, 3]);
  });

  it("does not reorder the board it was handed", () => {
    const board = [...BOARD];

    selectSuggestions(board, null, "least-upvotes");

    expect(board).toEqual(BOARD);
  });
});

describe("groupByStatus", () => {
  it("returns the three columns in the order the roadmap shows them", () => {
    expect(groupByStatus(BOARD).map((column) => column.status)).toEqual([
      "planned",
      "in-progress",
      "live",
    ]);
  });

  it("keeps suggestions off the roadmap and sorts each column by upvotes", () => {
    expect(groupByStatus(BOARD).map((column) => ids(column.items))).toEqual([
      [4],
      [5],
      [7, 6],
    ]);
  });

  it("still returns all three columns for an empty board", () => {
    expect(groupByStatus([]).map((column) => column.items)).toEqual([
      [],
      [],
      [],
    ]);
  });

  it("does not reorder the board it was handed", () => {
    const board = [...BOARD];

    groupByStatus(board);

    expect(board).toEqual(BOARD);
  });
});
