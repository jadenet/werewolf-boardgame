import { Team } from "../Interfaces";

export default function LobbyStatusBar(props: {
  playersCount: number;
  currentPhase: string | null;
  currentRoleName: string | null;
  activeAbilityName: string | null;
  winner: Team[] | null;
  formattedPhaseCountdown: string | null;
  canStartGame: boolean;
  onStartGame: () => void;
  canSkipDiscussion: boolean;
  onSkipDiscussion: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 w-full h-20 p-4 bg-base-200/80 backdrop-blur-sm border-t border-base-300">
      <div className="flex items-center gap-4">
        <div className="stat">
          <div className="stat-title">Players</div>
          <div className="stat-value text-primary">{props.playersCount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Phase</div>
          <div className="stat-value text-secondary">{props.currentPhase || "None"}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Role</div>
          <div className="stat-value text-secondary">{props.currentRoleName || "None"}</div>
        </div>
        {props.formattedPhaseCountdown && (
            <div className="rounded-xl border border-base-300 bg-base-200/80 px-3 py-2 text-right shadow-sm">
              <div className="text-xs uppercase tracking-wide text-base-content/60">Time Left</div>
              <div className="font-mono text-lg font-semibold text-base-content">{props.formattedPhaseCountdown}</div>
            </div>
          )}

          {props.canStartGame && (
            <button className="btn btn-primary btn-sm" onClick={props.onStartGame}>
              Start Game
            </button>
          )}

          {props.canSkipDiscussion && (
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" onClick={props.onSkipDiscussion}>
                Skip Discussion
              </button>
            </div>
          )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-base-content/70">
          Abilities: {props.activeAbilityName || "Waiting"}
        </div>
        {props.winner && (
          <div className="badge badge-success badge-lg">
            🏆 {props.winner}
          </div>
        )}
      </div>
    </div>
  );
}