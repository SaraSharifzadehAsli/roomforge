import { useEffect, useState } from "react";
import type { PartitionStep, Rect } from "../algorithm/types";

interface Props {
  steps: PartitionStep[];
  bounds: Rect;
}

/**
 * Plays back the sequence of recursive cuts that produced the currently
 * selected layout, one at a time. This exists for a reason beyond looking
 * nice: it's the "show your work" view — instead of a generative process
 * being an opaque black box that hands over a final answer, the user can
 * step through exactly how the algorithm arrived at it.
 */
export function StepPlayer({ steps, bounds }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 700);
    return () => clearTimeout(timer);
  }, [playing, stepIndex, steps.length]);

  const visibleSteps = steps.slice(0, stepIndex);

  return (
    <section className="step-player">
      <h2>How this layout was built</h2>
      <svg
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        className="floorplan-svg step-svg"
        role="img"
        aria-label={`Partition step ${stepIndex} of ${steps.length}`}
      >
        <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} className="step-bounds" />
        {visibleSteps.map((step, i) => {
          const isVerticalCutLine = step.orientation === "horizontal";
          const x1 = isVerticalCutLine ? step.first.x + step.first.width : step.first.x;
          const y1 = isVerticalCutLine ? step.first.y : step.first.y + step.first.height;
          const x2 = isVerticalCutLine ? step.first.x + step.first.width : step.first.x + step.first.width;
          const y2 = isVerticalCutLine ? step.first.y + step.first.height : step.first.y + step.first.height;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="cut-line" />;
        })}
      </svg>
      <div className="step-controls">
        <button type="button" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex === 0}>
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.min(steps.length, i + 1))}
          disabled={stepIndex >= steps.length}
        >
          Next →
        </button>
        <button type="button" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </button>
        <span className="step-count">
          {stepIndex} / {steps.length} cuts
        </span>
      </div>
    </section>
  );
}
