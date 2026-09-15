import { Player, Round } from "../../Interfaces";
import getTruncatedString from "../../shared/utils/getTruncatedString.ts";
import getVotesOnPlayerId from "../helpers/getVotesOnPlayerId.ts";
import getPlayerFromPlayerId from "../helpers/getPlayerFromPlayerId.ts";
import getAvatarUrl from "../helpers/getAvatarUrl.ts";
import { Socket } from "socket.io-client";

export default function PlayerCard(props: {
  player: Player;
  key: Player["id"];
  currentPlayer: Player;
  currentPhase: Round["status"];
  lynchVotes: Round["votes"];
  players: Player[];
  socket: React.MutableRefObject<Socket>;
  isTalking?: boolean;
  isMuted?: boolean;
  onToggleMute?: (playerId: Player["id"]) => void;
  abilityTargetSelectable?: boolean;
  abilityTargetSelected?: boolean;
  onAbilityTargetSelect?: (playerId: Player["id"]) => void;
  isKnownWerewolf?: boolean;
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
  const isDisconnected = props.player.connected === false;
  const votesOnPlayer = getVotesOnPlayerId(props.lynchVotes, props.player.id);
  const avatarUrl = getAvatarUrl(props.player.id || props.player.name || "player");
  const showIndicator = Boolean(props.isMuted);
  const votingForId = props.lynchVotes?.get(props.player.id);
  const votingForName = votingForId
    ? getPlayerFromPlayerId(props.players, votingForId)?.name
    : undefined;

  return (
    <div
      className={`group relative flex flex-col w-36 aspect-square rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
        isDisconnected ? "grayscale opacity-60" : ""
      } ${
        props.isTalking ? "ring-4 ring-success shadow-lg shadow-success/40" : ""
      } ${
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

        {/* Mute indicator/control (talking state is shown via the card's border glow instead) */}
        <div className={`absolute top-2 left-2 z-10 transition-opacity duration-200 ${showIndicator ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <button
            className={`btn btn-xs btn-circle shadow-md ${
              props.isMuted ? "btn-error" : "btn-ghost bg-base-100/80"
            }`}
            onClick={(event) => {
              event.stopPropagation();
              props.onToggleMute?.(props.player.id);
            }}
            aria-label={props.isMuted ? `Unmute ${props.player.name}` : `Mute ${props.player.name}`}
            title={props.isMuted ? `Unmute ${props.player.name}` : `Mute ${props.player.name}`}
          >
            {props.isMuted ? "🔇" : "🎤"}
          </button>
        </div>

        {props.abilityTargetSelectable && (
          <div className="absolute top-2 right-2">
            <div className={`badge badge-sm ${props.abilityTargetSelected ? "badge-secondary" : "badge-accent"}`}>
              {props.abilityTargetSelected ? "Selected" : "Ability"}
            </div>
          </div>
        )}

        {props.isKnownWerewolf && (
          <div className="absolute top-2 right-2">
            <div className="badge badge-sm badge-error gap-1" title="Fellow werewolf">🐺 Werewolf</div>
          </div>
        )}

        {isDisconnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-300/70 z-10">
            <div className="badge badge-neutral">Disconnected</div>
          </div>
        )}

        {votingForName && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <div className="badge badge-sm badge-secondary shadow-md whitespace-nowrap">
              Voting: {getTruncatedString(votingForName, 14)}
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
            {getTruncatedString(props.player.name, 18)}
            {props.player.isBot && <span className="ml-1 badge badge-xs badge-ghost align-middle">BOT</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

