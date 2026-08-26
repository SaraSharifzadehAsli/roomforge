import { describe, expect, it } from "vitest";
import { areAdjacent, sharedEdgeLength } from "./adjacency";
import type { Rect } from "./types";

describe("sharedEdgeLength / areAdjacent", () => {
  const a: Rect = { x: 0, y: 0, width: 10, height: 10 };

  it("detects a full right-edge touch", () => {
    const b: Rect = { x: 10, y: 0, width: 10, height: 10 };
    expect(sharedEdgeLength(a, b)).toBeCloseTo(10);
    expect(areAdjacent(a, b)).toBe(true);
  });

  it("detects a bottom-edge touch", () => {
    const b: Rect = { x: 0, y: 10, width: 10, height: 10 };
    expect(areAdjacent(a, b)).toBe(true);
  });

  it("does not count rects on the same edge line with no overlap as adjacent", () => {
    const b: Rect = { x: 10, y: 15, width: 10, height: 10 };
    expect(areAdjacent(a, b)).toBe(false);
  });

  it("does not count disjoint rects as adjacent", () => {
    const b: Rect = { x: 20, y: 20, width: 5, height: 5 };
    expect(areAdjacent(a, b)).toBe(false);
  });

  it("does not count overlapping (not merely touching) rects as adjacent", () => {
    const b: Rect = { x: 5, y: 0, width: 10, height: 10 };
    expect(sharedEdgeLength(a, b)).toBe(0);
  });
});
