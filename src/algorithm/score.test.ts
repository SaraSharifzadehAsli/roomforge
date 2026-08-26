import { describe, expect, it } from "vitest";
import { scoreLayout } from "./score";
import type { AdjacencyConstraint, PlacedRoom } from "./types";

describe("scoreLayout", () => {
  const rooms: PlacedRoom[] = [
    { id: "kitchen", name: "Kitchen", rect: { x: 0, y: 0, width: 10, height: 10 } },
    { id: "living", name: "Living Room", rect: { x: 10, y: 0, width: 10, height: 10 } },
    { id: "bath", name: "Bathroom", rect: { x: 0, y: 20, width: 10, height: 10 } },
  ];
  const weights = new Map([
    ["kitchen", 1],
    ["living", 1],
    ["bath", 1],
  ]);

  it("splits constraints into satisfied vs violated based on actual geometry", () => {
    const constraints: AdjacencyConstraint[] = [
      { a: "kitchen", b: "living" },
      { a: "kitchen", b: "bath" },
    ];
    const result = scoreLayout(rooms, constraints, weights);
    expect(result.satisfied).toEqual([{ a: "kitchen", b: "living" }]);
    expect(result.violated).toEqual([{ a: "kitchen", b: "bath" }]);
    expect(result.adjacencyScore).toBe(50);
  });

  it("defaults adjacencyScore to 100 when there are no constraints to satisfy", () => {
    const result = scoreLayout(rooms, [], weights);
    expect(result.adjacencyScore).toBe(100);
  });

  it("gives a perfect balanceScore when actual areas match target weights", () => {
    const result = scoreLayout(rooms, [], weights);
    expect(result.balanceScore).toBe(100);
  });

  it("lowers balanceScore when target weights don't match actual areas", () => {
    const skewedWeights = new Map([
      ["kitchen", 10],
      ["living", 1],
      ["bath", 1],
    ]);
    const result = scoreLayout(rooms, [], skewedWeights);
    expect(result.balanceScore).toBeLessThan(100);
  });

  it("weights overallScore as 70% adjacency + 30% balance", () => {
    const constraints: AdjacencyConstraint[] = [{ a: "kitchen", b: "bath" }];
    const result = scoreLayout(rooms, constraints, weights);
    expect(result.overallScore).toBe(Math.round(0 * 0.7 + 100 * 0.3));
  });
});
