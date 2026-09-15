import { useState } from "react";
import { Role, Team, VoteStatus } from "../../../Interfaces";
import { getWinnerAnnouncement } from "../../helpers/getWinnerAnnouncement";

export default function GameOverModal(props: {
  winner: Team[] | null;
  playAgainStatus: VoteStatus | null;
  onPlayAgainVote: () => void;
  revealedCenterRoles: Role[] | null;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-base-300 bg-base-100 px-10 py-8 shadow-2xl text-center max-w-md">
        <div className="text-sm uppercase tracking-widest text-base-content/60">Game Over</div>
        <div className="text-3xl font-bold text-primary">
          {getWinnerAnnouncement(props.winner)}
        </div>

        {props.revealedCenterRoles && props.revealedCenterRoles.length > 0 && (
          <div className="w-full">
            <div className="text-xs uppercase tracking-wide text-base-content/60 mb-2">Center Cards Were</div>
            <div className="flex justify-center gap-2">
              {props.revealedCenterRoles.map((role, index) => (
                <div key={index} className="badge badge-outline">{role.name}</div>
              ))}
            </div>
          </div>
        )}

        <button
          className={`btn btn-primary mt-2 ${hasVoted ? "btn-disabled" : ""}`}
          onClick={handlePlayAgainVote}
        >
          {hasVoted ? "Waiting for others..." : "Play Again"}
          {props.playAgainStatus && ` (${props.playAgainStatus.votes}/${props.playAgainStatus.required})`}
        </button>
      </div>
    </div>
  );
}

