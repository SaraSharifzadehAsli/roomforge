import type { AdjacencyConstraint, RoomSpec } from "./algorithm/types";

export const DEFAULT_ROOMS: RoomSpec[] = [
  { id: "living", name: "Living Room", weight: 3 },
  { id: "kitchen", name: "Kitchen", weight: 1.5 },
  { id: "bedroom", name: "Bedroom", weight: 2 },
  { id: "bathroom", name: "Bathroom", weight: 0.8 },
  { id: "office", name: "Office", weight: 1.2 },
];

export const DEFAULT_CONSTRAINTS: AdjacencyConstraint[] = [
  { a: "kitchen", b: "living" },
  { a: "bedroom", b: "bathroom" },
  { a: "office", b: "living" },
];
