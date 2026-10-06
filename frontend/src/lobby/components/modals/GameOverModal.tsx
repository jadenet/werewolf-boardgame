import { useState } from "react";
import { Team, VoteStatus } from "../../../Interfaces";
import { getWinnerAnnouncement } from "../../helpers/getWinnerAnnouncement";

export default function GameOverModal(props: {
  winner: Team[] | null;
  playAgainStatus: VoteStatus | null;
  onPlayAgainVote: () => void;
}) {
  const [hasVoted, setHasVoted] = useState(false);

  if (!props.winner || props.winner.length === 0) {
    return null;
  }

  const handlePlayAgainVote = () => {
    if (hasVoted) {
      return;
    }
    setHasVoted(true);
    props.onPlayAgainVote();
  };

  return (
    <section aria-label="Game results" className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-4 border-y border-base-300 bg-base-200/70 px-5 py-4">
      <div>
        <div className="text-xs font-semibold uppercase text-base-content/60">Game Over</div>
        <div className="mt-1 text-xl font-bold text-primary">
          {getWinnerAnnouncement(props.winner)}
        </div>
      </div>
      <button
        className={`btn btn-primary ${hasVoted ? "btn-disabled" : ""}`}
        onClick={handlePlayAgainVote}
      >
        {hasVoted ? "Waiting for others..." : "Play Again"}
        {props.playAgainStatus && ` (${props.playAgainStatus.votes}/${props.playAgainStatus.required})`}
      </button>
    </section>
  );
}

