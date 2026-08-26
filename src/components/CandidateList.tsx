import type { LayoutCandidate } from "../algorithm/types";

interface Props {
  candidates: LayoutCandidate[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function CandidateList({ candidates, selectedIndex, onSelect }: Props) {
  return (
    <section className="candidate-list">
      <h2>Top candidates ({candidates.length} searched)</h2>
      <ol>
        {candidates.slice(0, 6).map((candidate, index) => (
          <li key={candidate.order.join(",") + index}>
            <button
              type="button"
              className={index === selectedIndex ? "candidate-button selected" : "candidate-button"}
              onClick={() => onSelect(index)}
            >
              <span className="candidate-rank">#{index + 1}</span>
              <span className="candidate-score">{candidate.overallScore}</span>
              <span className="candidate-detail">
                adj {candidate.adjacencyScore}% · balance {candidate.balanceScore}%
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
