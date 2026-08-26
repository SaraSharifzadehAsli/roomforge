import { describe, expect, it } from "vitest";
import { attachNames, partition } from "./partition";
import type { PartitionStep, Rect, RoomSpec } from "./types";

function overlaps(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.width &&
    r2.x < r1.x + r1.width &&
    r1.y < r2.y + r2.height &&
    r2.y < r1.y + r1.height
  );
}

describe("partition", () => {
  const rooms: RoomSpec[] = [
    { id: "a", name: "A", weight: 1 },
    { id: "b", name: "B", weight: 1 },
    { id: "c", name: "C", weight: 2 },
    { id: "d", name: "D", weight: 1 },
  ];
  const bounds: Rect = { x: 0, y: 0, width: 100, height: 100 };
  const weights = new Map(rooms.map((r) => [r.id, r.weight]));

  function run() {
    const steps: PartitionStep[] = [];
    const placed = partition(rooms.map((r) => r.id), weights, bounds, "horizontal", steps);
    return { placed, steps };
  }

  it("produces exactly one rectangle per room, each id exactly once", () => {
    const { placed } = run();
    expect(placed).toHaveLength(4);
    expect(placed.map((p) => p.id).sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("preserves total area (no gaps, no double-counting)", () => {
    const { placed } = run();
    const totalArea = placed.reduce((sum, p) => sum + p.rect.width * p.rect.height, 0);
    expect(totalArea).toBeCloseTo(100 * 100);
  });

  it("never overlaps two rooms", () => {
    const { placed } = run();
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        expect(overlaps(placed[i].rect, placed[j].rect)).toBe(false);
      }
    }
  });

  it("records exactly n-1 split steps for n rooms", () => {
    const { steps } = run();
    expect(steps).toHaveLength(rooms.length - 1);
  });

  it("gives a weight-2 room roughly double the area of a weight-1 room", () => {
    const { placed } = run();
    const roomC = placed.find((p) => p.id === "c")!;
    const roomA = placed.find((p) => p.id === "a")!;
    const ratio = (roomC.rect.width * roomC.rect.height) / (roomA.rect.width * roomA.rect.height);
    expect(ratio).toBeGreaterThan(1.5);
    expect(ratio).toBeLessThan(2.5);
  });

  it("fills the entire bounds for a single room", () => {
    const single = partition(["only"], new Map([["only", 5]]), bounds, "horizontal", []);
    expect(single).toHaveLength(1);
    expect(single[0].rect).toEqual(bounds);
  });

  it("throws on an empty order rather than silently returning nothing", () => {
    expect(() => partition([], weights, bounds, "horizontal", [])).toThrow();
  });

  it("attachNames fills in every room's display name from the room list", () => {
    const { placed } = run();
    const named = attachNames(placed, rooms);
    expect(named.find((r) => r.id === "c")?.name).toBe("C");
  });
});
