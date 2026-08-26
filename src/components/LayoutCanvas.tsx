import type { LayoutCandidate, Rect } from "../algorithm/types";

interface Props {
  candidate: LayoutCandidate;
  bounds: Rect;
}

const PALETTE = ["#5b8def", "#f2a541", "#5bbf8a", "#e0607e", "#8a6fdf", "#4fb6c9"];

export function LayoutCanvas({ candidate, bounds }: Props) {
  function colorFor(id: string) {
    const index = candidate.rooms.findIndex((r) => r.id === id);
    return PALETTE[index % PALETTE.length];
  }

  function centerOf(id: string) {
    const room = candidate.rooms.find((r) => r.id === id);
    if (!room) return null;
    return { x: room.rect.x + room.rect.width / 2, y: room.rect.y + room.rect.height / 2 };
  }

  return (
    <section className="layout-canvas">
      <h2>Generated layout — score {candidate.overallScore}</h2>
      <svg
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        className="floorplan-svg"
        role="img"
        aria-label={`Floor plan with overall score ${candidate.overallScore}`}
      >
        {candidate.rooms.map((room) => (
          <g key={room.id}>
            <rect
              x={room.rect.x}
              y={room.rect.y}
              width={room.rect.width}
              height={room.rect.height}
              fill={colorFor(room.id)}
              fillOpacity={0.25}
              stroke={colorFor(room.id)}
              strokeWidth={2}
            />
            <text
              x={room.rect.x + room.rect.width / 2}
              y={room.rect.y + room.rect.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="room-label"
            >
              {room.name}
            </text>
          </g>
        ))}
        {candidate.satisfiedConstraints.map((c) => {
          const a = centerOf(c.a);
          const b = centerOf(c.b);
          if (!a || !b) return null;
          return (
            <line
              key={`${c.a}-${c.b}-ok`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="constraint-line satisfied"
            />
          );
        })}
        {candidate.violatedConstraints.map((c) => {
          const a = centerOf(c.a);
          const b = centerOf(c.b);
          if (!a || !b) return null;
          return (
            <line
              key={`${c.a}-${c.b}-bad`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="constraint-line violated"
            />
          );
        })}
      </svg>
      <dl className="score-breakdown">
        <div>
          <dt>Adjacency</dt>
          <dd>{candidate.adjacencyScore}%</dd>
        </div>
        <div>
          <dt>Area balance</dt>
          <dd>{candidate.balanceScore}%</dd>
        </div>
      </dl>
    </section>
  );
}
