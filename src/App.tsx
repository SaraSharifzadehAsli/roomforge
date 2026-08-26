import { useMemo, useState } from "react";
import { DEFAULT_CONSTRAINTS, DEFAULT_ROOMS } from "./demoData";
import { generateCandidates } from "./algorithm/generate";
import type { AdjacencyConstraint, RoomSpec } from "./algorithm/types";
import { ConstraintEditor } from "./components/ConstraintEditor";
import { LayoutCanvas } from "./components/LayoutCanvas";
import { StepPlayer } from "./components/StepPlayer";
import { CandidateList } from "./components/CandidateList";

const BOUNDS = { x: 0, y: 0, width: 480, height: 320 };
const SEARCH_ATTEMPTS = 24;

export default function App() {
  const [rooms, setRooms] = useState<RoomSpec[]>(DEFAULT_ROOMS);
  const [constraints, setConstraints] = useState<AdjacencyConstraint[]>(DEFAULT_CONSTRAINTS);
  const [seed, setSeed] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const candidates = useMemo(
    () => generateCandidates(rooms, constraints, BOUNDS, { attempts: SEARCH_ATTEMPTS, seed }),
    [rooms, constraints, seed]
  );

  const selected = candidates[selectedIndex] ?? candidates[0];

  function handleRoomsChange(next: RoomSpec[]) {
    setRooms(next);
    setSelectedIndex(0);
  }

  function handleConstraintsChange(next: AdjacencyConstraint[]) {
    setConstraints(next);
    setSelectedIndex(0);
  }

  function handleRegenerate() {
    setSeed((s) => s + 1);
    setSelectedIndex(0);
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>RoomForge</h1>
        <p>
          A constraint-based floor-plan generator. List the rooms you want and which ones must
          touch — everything below runs a real recursive slicing algorithm that searches room
          orderings for a layout satisfying your constraints, not a fixed template.
        </p>
      </header>

      <section className="layout-grid">
        <ConstraintEditor
          rooms={rooms}
          constraints={constraints}
          onRoomsChange={handleRoomsChange}
          onConstraintsChange={handleConstraintsChange}
          onRegenerate={handleRegenerate}
        />

        {selected ? (
          <>
            <LayoutCanvas candidate={selected} bounds={BOUNDS} />
            <StepPlayer steps={selected.steps} bounds={BOUNDS} />
            <CandidateList candidates={candidates} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
          </>
        ) : (
          <p className="empty-state">Add at least one room to generate a layout.</p>
        )}
      </section>
    </main>
  );
}
