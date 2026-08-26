import { describe, expect, it } from "vitest";
import { generateCandidates } from "./generate";
import type { AdjacencyConstraint, Rect, RoomSpec } from "./types";

describe("generateCandidates", () => {
  const rooms: RoomSpec[] = [
    { id: "living", name: "Living Room", weight: 3 },
    { id: "kitchen", name: "Kitchen", weight: 1.5 },
    { id: "bedroom", name: "Bedroom", weight: 2 },
    { id: "bathroom", name: "Bathroom", weight: 0.8 },
    { id: "office", name: "Office", weight: 1.2 },
  ];
  const constraints: AdjacencyConstraint[] = [
    { a: "kitchen", b: "living" },
    { a: "bedroom", b: "bathroom" },
    { a: "office", b: "living" },
  ];
  const bounds: Rect = { x: 0, y: 0, width: 200, height: 120 };

  it("is deterministic: same seed + same input -> identical output", () => {
    const first = generateCandidates(rooms, constraints, bounds, { attempts: 20, seed: 42 });
    const second = generateCandidates(rooms, constraints, bounds, { attempts: 20, seed: 42 });
    expect(second).toEqual(first);
  });

  it("returns the requested number of candidates, sorted best-first", () => {
    const candidates = generateCandidates(rooms, constraints, bounds, { attempts: 20, seed: 42 });
    expect(candidates).toHaveLength(20);
    for (let i = 1; i < candidates.length; i++) {
      expect(candidates[i].overallScore).toBeLessThanOrEqual(candidates[i - 1].overallScore);
    }
  });

  it("finds a reasonably good layout for a satisfiable constraint set", () => {
    const candidates = generateCandidates(rooms, constraints, bounds, { attempts: 20, seed: 42 });
    expect(candidates[0].overallScore).toBeGreaterThanOrEqual(60);
  });

  it("never gets worse with more search attempts", () => {
    const fewer = generateCandidates(rooms, constraints, bounds, { attempts: 20, seed: 42 });
    const more = generateCandidates(rooms, constraints, bounds, { attempts: 40, seed: 42 });
    expect(more[0].overallScore).toBeGreaterThanOrEqual(fewer[0].overallScore);
  });

  it("produces a different candidate set for a different seed", () => {
    const a = generateCandidates(rooms, constraints, bounds, { attempts: 20, seed: 42 });
    const b = generateCandidates(rooms, constraints, bounds, { attempts: 20, seed: 999 });
    expect(b).not.toEqual(a);
  });

  it("returns an empty array for an empty room list rather than throwing", () => {
    expect(generateCandidates([], [], bounds)).toEqual([]);
  });
});
