import { areAdjacent } from "./adjacency";
import type { AdjacencyConstraint, PlacedRoom } from "./types";

export interface ScoreResult {
  adjacencyScore: number;
  balanceScore: number;
  overallScore: number;
  satisfied: AdjacencyConstraint[];
  violated: AdjacencyConstraint[];
}

/**
 * Pure scoring: no geometry construction, no randomness — just placed rooms
 * (rectangles) and constraints in, a graded result out. Same design as
 * PagePulse's score.ts: keep the judgment calls (the weights below) in one
 * small, dependency-free place where they're easy to see and argue with.
 *
 * - adjacencyScore: percentage of requested adjacency constraints that are
 *   actually satisfied by the generated geometry (two rooms sharing a wall).
 *   This is the part the user directly asked for, so it dominates the
 *   overall score.
 * - balanceScore: how close each room's actual area share is to its
 *   requested weight share, measured as total absolute deviation (which
 *   ranges from 0 for a perfect match to 2 for two totally disjoint
 *   distributions) and rescaled to 0-100.
 * - overallScore: adjacency at 70%, balance at 30% — satisfying the
 *   relationships the user asked for matters more than exact proportions.
 */
export function scoreLayout(
  rooms: PlacedRoom[],
  constraints: AdjacencyConstraint[],
  targetWeights: Map<string, number>
): ScoreResult {
  const byId = new Map(rooms.map((r) => [r.id, r]));
  const satisfied: AdjacencyConstraint[] = [];
  const violated: AdjacencyConstraint[] = [];

  for (const constraint of constraints) {
    const a = byId.get(constraint.a);
    const b = byId.get(constraint.b);
    if (a && b && areAdjacent(a.rect, b.rect)) {
      satisfied.push(constraint);
    } else {
      violated.push(constraint);
    }
  }

  const adjacencyScore =
    constraints.length === 0 ? 100 : Math.round((satisfied.length / constraints.length) * 100);

  const totalWeight = sum([...targetWeights.values()]);
  const totalArea = sum(rooms.map((r) => r.rect.width * r.rect.height));

  let deviationSum = 0;
  if (totalWeight > 0 && totalArea > 0) {
    for (const room of rooms) {
      const targetShare = (targetWeights.get(room.id) ?? 0) / totalWeight;
      const actualShare = (room.rect.width * room.rect.height) / totalArea;
      deviationSum += Math.abs(targetShare - actualShare);
    }
  }
  const balanceScore = Math.round(clamp(100 - (deviationSum / 2) * 100, 0, 100));

  const overallScore = Math.round(adjacencyScore * 0.7 + balanceScore * 0.3);

  return { adjacencyScore, balanceScore, overallScore, satisfied, violated };
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
