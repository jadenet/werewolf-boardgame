import { Player, Round } from "../Interfaces";
import getTrunucatedString from "../functions/getTrunucatedString";
import getVotesOnPlayerId from "../functions/getVotesOnPlayerId.ts";
import getAvatarUrl from "../functions/getAvatarUrl.ts";

export default function PlayerCard(props: {
  player: Player;
  key: Player["id"];
  currentPlayer: Player;
  currentPhase: Round["status"];
  lynchVotes: Round["votes"];
  socket: React.MutableRefObject<any>;
  abilityTargetSelectable?: boolean;
  abilityTargetSelected?: boolean;
  onAbilityTargetSelect?: (playerId: Player["id"]) => void;
}) {
  function emitPlayerClicked(player: Player) {
    if (props.onAbilityTargetSelect) {
      props.onAbilityTargetSelect(player.id);
    } else if (props.currentPhase === "Voting") {
      // Emit vote for this player
      props.socket.current.emit("vote", props.player.id);
    }
  }

  const isCurrentPlayer = props.currentPlayer.id && props.player.id === props.currentPlayer.id;
  const votesOnPlayer = getVotesOnPlayerId(props.lynchVotes, props.player.id);
  const avatarUrl = getAvatarUrl(props.player.id || props.player.name || "player");

  return (
    <div
      className={`relative flex flex-col w-56 aspect-square rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
        props.abilityTargetSelected
          ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20"
          : props.abilityTargetSelectable
            ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
            : isCurrentPlayer
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-base-300 bg-base-100 hover:border-primary/50 hover:shadow-lg"
      }`}
      onClick={() => emitPlayerClicked(props.player)}
    >
      {/* Vote count badge */}
      {votesOnPlayer > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="badge badge-primary badge-lg shadow-lg animate-pulse">
            {votesOnPlayer}
          </div>
        </div>
      )}

      {/* Avatar container */}
      <div className="relative w-full h-4/5 rounded-t-2xl overflow-hidden bg-gradient-to-br from-base-200 to-base-300">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_hsl(var(--p)/0.4),_transparent_60%)]" />
        <img
          src={avatarUrl}
          alt={`${props.player.name} avatar`}
          className="relative z-[1] h-full w-full object-cover"
        />
        <audio id={"audio-" + props.player.id} autoPlay className="hidden" />

        {/* Overlay for current player indicator */}
        {isCurrentPlayer && (
          <div className="absolute top-2 left-2">
            <div className="badge badge-secondary badge-sm">You</div>
          </div>
        )}

        {props.abilityTargetSelectable && (
          <div className="absolute top-2 right-2">
            <div className={`badge badge-sm ${props.abilityTargetSelected ? "badge-secondary" : "badge-accent"}`}>
              {props.abilityTargetSelected ? "Selected" : "Ability"}
            </div>
          </div>
        )}
      </div>

      {/* Name container */}
      <div className="h-10 flex justify-center items-center p-3 bg-base-200/80 backdrop-blur-sm w-full text-center bottom-0 rounded-b-2xl">
        <div className="tooltip tooltip-top" data-tip={props.player.name}>
          <p className={`text-center font-medium truncate ${
            isCurrentPlayer ? "text-primary font-semibold" : "text-base-content"
          }`}>
            {getTrunucatedString(props.player.name, 18)}
          </p>
        </div>
      </div>
    </div>
  );
}
