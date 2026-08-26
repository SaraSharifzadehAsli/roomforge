import type { Rect } from "./types";

const EPS = 1e-6;

/**
 * Length of the shared boundary between two axis-aligned rectangles, or 0 if
 * they don't share an edge. Two rects are "adjacent" in a floor plan when one
 * of these is true: rect A's right edge lines up with rect B's left edge (or
 * vice versa), or A's bottom lines up with B's top (or vice versa) — and the
 * overlapping span along that shared line is positive.
 */
export function sharedEdgeLength(a: Rect, b: Rect): number {
  const verticalTouch =
    Math.abs(a.x + a.width - b.x) < EPS || Math.abs(b.x + b.width - a.x) < EPS;
  if (verticalTouch) {
    const overlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    if (overlap > EPS) return overlap;
  }

  const horizontalTouch =
    Math.abs(a.y + a.height - b.y) < EPS || Math.abs(b.y + b.height - a.y) < EPS;
  if (horizontalTouch) {
    const overlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    if (overlap > EPS) return overlap;
  }

  return 0;
}

export function areAdjacent(a: Rect, b: Rect, minSharedLength = 0.5): boolean {
  return sharedEdgeLength(a, b) > minSharedLength;
}
