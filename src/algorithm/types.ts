export interface RoomSpec {
  id: string;
  name: string;
  /** Relative area weight — a room with weight 2 should end up roughly twice the area of a weight-1 room. */
  weight: number;
}

export interface AdjacencyConstraint {
  a: string;
  b: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlacedRoom {
  id: string;
  name: string;
  rect: Rect;
}

export type Orientation = "horizontal" | "vertical";

/** One recursive split, recorded so the UI can play the generation back step by step. */
export interface PartitionStep {
  parent: Rect;
  orientation: Orientation;
  first: Rect;
  second: Rect;
  roomIdsInFirst: string[];
  roomIdsInSecond: string[];
}

export interface LayoutCandidate {
  order: string[];
  rooms: PlacedRoom[];
  steps: PartitionStep[];
  adjacencyScore: number;
  balanceScore: number;
  overallScore: number;
  satisfiedConstraints: AdjacencyConstraint[];
  violatedConstraints: AdjacencyConstraint[];
}
