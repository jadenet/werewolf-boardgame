import { Round, Team } from "../Interfaces";

function getPhaseDisplay(currentPhase: Round["status"]) {
  switch (currentPhase) {
    case "PreGame":
      return { text: "Waiting for Players", icon: "⏳", color: "text-base-content" };
    case "Discussion":
      return { text: "Discussion Phase", icon: "💬", color: "text-primary" };
    case "Voting":
      return { text: "Voting Phase", icon: "🗳️", color: "text-secondary" };
    case "Night":
      return { text: "Night Phase", icon: "🌙", color: "text-accent" };
    default:
      return { text: currentPhase || "Loading...", icon: "🎭", color: "text-base-content" };
  }
}

export default function PhaseStatusBanner(props: {
  currentPhase: Round["status"];
  winner: Team[] | null;
  formattedPhaseCountdown: string | null;
  canStartGame: boolean;
  onStartGame: () => void;
  canSkipDiscussion: boolean;
  onSkipDiscussion: () => void;
}) {
  const phaseInfo = getPhaseDisplay(props.currentPhase);

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-base-300 bg-base-100/90 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between w-full gap-4 p-4">
        <div className="flex items-center gap-3">
          <span className={`text-2xl ${phaseInfo.color}`}>{phaseInfo.icon}</span>
          <div>
            <h3 className={`font-bold text-lg ${phaseInfo.color}`}>{phaseInfo.text}</h3>
            {props.winner && props.winner.length > 0 && (
              <p className="text-sm">
                Winner{props.winner.length > 1 ? "s" : ""}: <span className="font-semibold text-success">{props.winner.join(", ")}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          
        </div>
      </div>
    </div>
  );
}