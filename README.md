# RoomForge

A constraint-based floor-plan generator. You describe the rooms you want and which ones need to
be next to each other; RoomForge searches for a rectangular floor plan that satisfies those
constraints, using a real recursive slicing algorithm — not a fixed template or a hand-drawn
layout with the numbers swapped in.

```
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run lint
npm run build
```

## Why this exists

This is the second of two portfolio projects, and it's deliberately built to cover ground the
first one (PagePulse, an accessibility/performance auditor) doesn't: a real search/optimization
algorithm with actual computational content, plus an interface designed around exposing a
generative process to the person using it instead of just handing them one final answer.

The problem itself — arranging rooms in a floor plan so that some pairs are next to each other
while keeping relative sizes sensible — is a small, self-contained version of a real research
area: "slicing floorplans" are used in VLSI chip layout and architectural space planning, and
constraint-driven generative layout is an active area in generative design and mixed-initiative
design tools (systems where a person states *what* they want and a system proposes *how*, rather
than the person drawing every pixel by hand).

## How the algorithm works

A floor plan here is represented as a binary tree: every internal node is a single cut — either a
vertical line splitting the space left/right, or a horizontal line splitting it top/bottom — and
every leaf is one room. This is exactly why two rooms end up sharing a wall: it happens when (and
only when) they're close together in the room *ordering* the tree was built from and land as
sibling subtrees. That's the core idea `src/algorithm/partition.ts` implements: given an ordering
of rooms and their relative sizes, recursively split the bounding rectangle into a balanced
prefix/suffix at each level (by total weight, not just by count), alternating cut orientation with
depth.

Since the ordering is what determines adjacency, satisfying the user's adjacency constraints
becomes a search over orderings rather than over rectangle positions directly
(`src/algorithm/generate.ts`):

1. One ordering is built directly from the constraint graph — a breadth-first walk that keeps
   rooms which must be adjacent close together in the sequence before anything else happens.
2. The rest are deterministic, seeded random shuffles of the room list (a small
   [mulberry32](https://github.com/bryc/code/blob/master/jshash/PRNGs.md) PRNG — same seed, same
   shuffle, every time, which is what makes the whole search reproducible and testable).
3. Every resulting layout is scored (`src/algorithm/score.ts`) on two things: what fraction of the
   requested adjacencies actually ended up sharing a wall (checked geometrically —
   `src/algorithm/adjacency.ts` — not assumed), and how close each room's actual area is to its
   requested weight. The candidates are ranked by a weighted combination of the two, and the app
   shows you the top few, not just one.

This is a genuine best-of-N combinatorial search, not a single fixed heuristic — more attempts can
only find an equal-or-better layout, never a worse one, which is one of the properties covered by
the test suite.

## The interface: showing the generation, not just the result

Two things beyond the algorithm itself:

- **Multiple ranked candidates, not one answer.** The search produces several layouts; you can
  browse the top few and see exactly how their scores differ, rather than trusting a single
  black-box output.
- **Step-through playback.** `StepPlayer` replays the recursive cuts that built the currently
  selected layout, one at a time, instead of only showing the finished rectangle. The goal is
  transparency into *how* a generative system arrived at what it's showing you — a real design
  question in generative/mixed-initiative tools, not just a nice animation.

## What's tested, and what isn't

- `adjacency.ts`, `partition.ts`, `score.ts`, and `generate.ts` have full unit coverage — they're
  the entire algorithmic core, and none of them touch the DOM or React, which is what makes them
  fast and reliable to test in isolation. This includes a determinism check (same seed -> byte-
  identical output) and a monotonicity check (more search attempts never produces a worse best
  candidate).
- `ConstraintEditor` has component-level tests (`@testing-library/react`) covering adding a room,
  rejecting an empty room name, listing existing rooms, and adding an adjacency constraint.
- `LayoutCanvas` and `StepPlayer` are exercised by running the app itself — they're SVG rendering
  of already-tested data, which is lower-value to unit test than the logic that produces that data.

## Honest limitations

- The layouts are always rectangular subdivisions (slicing floorplans). Real floor plans sometimes
  need L-shaped rooms or non-slicing arrangements that this algorithm's tree structure can't
  represent — that's a known limitation of the slicing-floorplan model itself, not an oversight.
- With more than a handful of adjacency constraints, or constraints that conflict with each other
  (e.g. three rooms that must all be mutually adjacent to each other in a way no single ordering
  can satisfy), the search may not find a layout that satisfies all of them — it reports the best
  it found and which constraints it couldn't satisfy, rather than pretending otherwise.
- This has no user-testing or real interaction-design research behind it — the "show the
  generation process" idea is informed by reading about mixed-initiative design tools, not by
  running a study.

## Possible next steps

- Let the user drag a cut line to manually override part of a generated layout.
- Support L-shaped rooms via a non-slicing (graph-based) layout representation.
- Surface *why* a specific constraint was violated (e.g. "no ordering found puts both required
  neighbors next to Office at once") instead of just marking it unsatisfied.
