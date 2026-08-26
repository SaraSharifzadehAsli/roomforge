import { useState } from "react";
import type { AdjacencyConstraint, RoomSpec } from "../algorithm/types";

interface Props {
  rooms: RoomSpec[];
  constraints: AdjacencyConstraint[];
  onRoomsChange: (rooms: RoomSpec[]) => void;
  onConstraintsChange: (constraints: AdjacencyConstraint[]) => void;
  onRegenerate: () => void;
}

let nextRoomId = 0;

export function ConstraintEditor({
  rooms,
  constraints,
  onRoomsChange,
  onConstraintsChange,
  onRegenerate,
}: Props) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("1");
  const [pairA, setPairA] = useState("");
  const [pairB, setPairB] = useState("");

  function addRoom() {
    const trimmed = name.trim();
    const parsedWeight = Number(weight);
    if (!trimmed || !Number.isFinite(parsedWeight) || parsedWeight <= 0) return;
    const id = `room-${nextRoomId++}`;
    onRoomsChange([...rooms, { id, name: trimmed, weight: parsedWeight }]);
    setName("");
    setWeight("1");
  }

  function removeRoom(id: string) {
    onRoomsChange(rooms.filter((r) => r.id !== id));
    onConstraintsChange(constraints.filter((c) => c.a !== id && c.b !== id));
  }

  function addConstraint() {
    if (!pairA || !pairB || pairA === pairB) return;
    const alreadyExists = constraints.some(
      (c) => (c.a === pairA && c.b === pairB) || (c.a === pairB && c.b === pairA)
    );
    if (alreadyExists) return;
    onConstraintsChange([...constraints, { a: pairA, b: pairB }]);
  }

  function removeConstraint(index: number) {
    onConstraintsChange(constraints.filter((_, i) => i !== index));
  }

  function nameOf(id: string) {
    return rooms.find((r) => r.id === id)?.name ?? id;
  }

  return (
    <section className="constraint-editor">
      <h2>Rooms</h2>
      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room.id}>
            <span>{room.name}</span>
            <span className="room-weight">weight {room.weight}</span>
            <button type="button" onClick={() => removeRoom(room.id)} aria-label={`Remove ${room.name}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="add-room-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Room name"
          aria-label="New room name"
        />
        <input
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight"
          type="number"
          min="0.1"
          step="0.1"
          aria-label="New room weight"
        />
        <button type="button" onClick={addRoom}>
          Add room
        </button>
      </div>

      <h2>Must be adjacent</h2>
      <ul className="constraint-list">
        {constraints.map((c, i) => (
          <li key={`${c.a}-${c.b}`}>
            <span>
              {nameOf(c.a)} ↔ {nameOf(c.b)}
            </span>
            <button type="button" onClick={() => removeConstraint(i)} aria-label="Remove constraint">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="add-constraint-form">
        <select value={pairA} onChange={(e) => setPairA(e.target.value)} aria-label="First room">
          <option value="">Room A</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select value={pairB} onChange={(e) => setPairB(e.target.value)} aria-label="Second room">
          <option value="">Room B</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={addConstraint}>
          Require adjacency
        </button>
      </div>

      <button type="button" className="regenerate-button" onClick={onRegenerate}>
        Regenerate (new search)
      </button>
    </section>
  );
}
