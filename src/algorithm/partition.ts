import type { Orientation, PartitionStep, PlacedRoom, Rect, RoomSpec } from "./types";

/**
 * Recursively slices `bounds` into one rectangle per room in `order`.
 *
 * This is a "slicing floorplan" — the same structure used in VLSI chip
 * floorplanning and architectural space-planning research: every internal
 * node of the recursion is a single horizontal-or-vertical cut, so the whole
 * layout is described by a binary tree whose leaves are rooms. Two rooms end
 * up sharing a wall when (and only when) they are close together in `order`
 * and end up as sibling subtrees — which is exactly why the search step
 * (generate.ts) works by searching over *orderings* of rooms rather than
 * searching over rectangle positions directly.
 *
 * At each split, the room order is divided into two contiguous groups whose
 * total weight is as close to equal as possible (a linear scan over the
 * prefix sums), and the cut alternates orientation with recursion depth so
 * the result isn't a single row or column of ever-thinner slivers.
 *
 * Complexity: each level does O(k) work to find the balanced split point for
 * a group of k rooms, and the recursion depth is O(log n) when splits stay
 * balanced, giving O(n log n) overall — degrading toward O(n^2) in the
 * worst case of a very unbalanced weight distribution (e.g. one room with
 * almost all the weight), same as an unbalanced quicksort partition.
 */
export function partition(
  order: string[],
  weights: Map<string, number>,
  bounds: Rect,
  orientation: Orientation,
  steps: PartitionStep[]
): Omit<PlacedRoom, "name">[] {
  if (order.length === 0) {
    throw new Error("partition() called with an empty room order");
  }

  if (order.length === 1) {
    return [{ id: order[0], rect: bounds }];
  }

  const splitIndex = balancedSplitIndex(order, weights);
  const firstIds = order.slice(0, splitIndex);
  const secondIds = order.slice(splitIndex);

  const firstWeight = sumWeights(firstIds, weights);
  const totalWeight = sumWeights(order, weights);
  const ratio = totalWeight === 0 ? 0.5 : firstWeight / totalWeight;

  let firstRect: Rect;
  let secondRect: Rect;
  if (orientation === "horizontal") {
    const w1 = bounds.width * ratio;
    firstRect = { x: bounds.x, y: bounds.y, width: w1, height: bounds.height };
    secondRect = { x: bounds.x + w1, y: bounds.y, width: bounds.width - w1, height: bounds.height };
  } else {
    const h1 = bounds.height * ratio;
    firstRect = { x: bounds.x, y: bounds.y, width: bounds.width, height: h1 };
    secondRect = { x: bounds.x, y: bounds.y + h1, width: bounds.width, height: bounds.height - h1 };
  }

  steps.push({
    parent: bounds,
    orientation,
    first: firstRect,
    second: secondRect,
    roomIdsInFirst: firstIds,
    roomIdsInSecond: secondIds,
  });

  const nextOrientation: Orientation = orientation === "horizontal" ? "vertical" : "horizontal";
  const firstRooms = partition(firstIds, weights, firstRect, nextOrientation, steps);
  const secondRooms = partition(secondIds, weights, secondRect, nextOrientation, steps);
  return [...firstRooms, ...secondRooms];
}

function sumWeights(ids: string[], weights: Map<string, number>): number {
  return ids.reduce((sum, id) => sum + (weights.get(id) ?? 0), 0);
}

/** Finds the prefix length whose weight sum is closest to half the total. */
function balancedSplitIndex(order: string[], weights: Map<string, number>): number {
  const total = sumWeights(order, weights);
  let cumulative = 0;
  let bestIndex = 1;
  let bestDiff = Infinity;
  for (let k = 1; k < order.length; k++) {
    cumulative += weights.get(order[k - 1]) ?? 0;
    const diff = Math.abs(cumulative - (total - cumulative));
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = k;
    }
  }
  return bestIndex;
}

export function attachNames(
  placed: Omit<PlacedRoom, "name">[],
  rooms: RoomSpec[]
): PlacedRoom[] {
  const names = new Map(rooms.map((r) => [r.id, r.name]));
  return placed.map((p) => ({ ...p, name: names.get(p.id) ?? p.id }));
}
