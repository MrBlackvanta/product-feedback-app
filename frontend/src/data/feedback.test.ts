import { describe, expect, it } from "vitest";
import { parseFeedbackId } from "./feedback";

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
