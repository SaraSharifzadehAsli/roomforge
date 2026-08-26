import { attachNames, partition } from "./partition";
import { scoreLayout } from "./score";
import type { AdjacencyConstraint, LayoutCandidate, PartitionStep, Rect, RoomSpec } from "./types";

export interface GenerateOptions {
  /** How many candidate orderings to try. More attempts = better best-of-N, at linear cost. */
  attempts?: number;
  /** Seed for the deterministic PRNG — same seed + same input always produces the same candidates. */
  seed?: number;
}

/**
 * Generates and ranks several candidate floor plans for the same room list
 * and constraints, by trying several different room *orderings* through the
 * slicing partition and scoring each result (see partition.ts for why
 * ordering is what determines adjacency).
 *
 * One ordering is not random: it's built by walking the constraint graph
 * (rooms that must be adjacent are visited near each other), which tends to
 * produce a strong first candidate on its own. The rest are seeded random
 * shuffles, so this is a small best-of-N combinatorial search, not a single
 * fixed heuristic — increasing `attempts` provably cannot make the best
 * candidate's score worse, only find an equal or better one.
 */
export function generateCandidates(
  rooms: RoomSpec[],
  constraints: AdjacencyConstraint[],
  bounds: Rect,
  options: GenerateOptions = {}
): LayoutCandidate[] {
  if (rooms.length === 0) return [];

  const attempts = Math.max(1, options.attempts ?? 12);
  const seed = options.seed ?? 1;
  const ids = rooms.map((r) => r.id);

  const orders: string[][] = [orderByConstraintClusters(rooms, constraints)];
  for (let i = 0; orders.length < attempts; i++) {
    orders.push(shuffledWithSeed(ids, seed + i * 97 + 1));
  }

  const candidates = orders.map((order) => buildCandidate(order, rooms, constraints, bounds));
  return candidates.sort((a, b) => b.overallScore - a.overallScore);
}

function buildCandidate(
  order: string[],
  rooms: RoomSpec[],
  constraints: AdjacencyConstraint[],
  bounds: Rect
): LayoutCandidate {
  const weights = new Map(rooms.map((r) => [r.id, r.weight]));
  const steps: PartitionStep[] = [];
  const placed = partition(order, weights, bounds, "horizontal", steps);
  const placedRooms = attachNames(placed, rooms);
  const { adjacencyScore, balanceScore, overallScore, satisfied, violated } = scoreLayout(
    placedRooms,
    constraints,
    weights
  );

  return {
    order,
    rooms: placedRooms,
    steps,
    adjacencyScore,
    balanceScore,
    overallScore,
    satisfiedConstraints: satisfied,
    violatedConstraints: violated,
  };
}

/**
 * Orders rooms by walking the adjacency-constraint graph (BFS from each
 * unvisited room), so rooms that must be adjacent tend to land near each
 * other in the sequence before any randomization happens.
 */
function orderByConstraintClusters(rooms: RoomSpec[], constraints: AdjacencyConstraint[]): string[] {
  const graph = new Map<string, string[]>(rooms.map((r) => [r.id, []]));
  for (const c of constraints) {
    graph.get(c.a)?.push(c.b);
    graph.get(c.b)?.push(c.a);
  }

  const visited = new Set<string>();
  const order: string[] = [];
  for (const room of rooms) {
    if (visited.has(room.id)) continue;
    const queue = [room.id];
    visited.add(room.id);
    while (queue.length > 0) {
      const current = queue.shift() as string;
      order.push(current);
      for (const neighbor of graph.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }
  return order;
}

/** mulberry32 — a small, fast, deterministic PRNG. Same seed -> same sequence, every time. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledWithSeed<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
