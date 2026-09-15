import { Player, PlayerStatus } from "../../../Interfaces.ts";
import getAvatarUrl from "../../helpers/getAvatarUrl.ts";
import getTruncatedString from "../../../shared/utils/getTruncatedString.ts";

export default function PlayersTab(props: {
  players: Player[];
  currentPlayerId: Player["id"] | null;
  isHost: boolean;
  gameStarted: boolean;
  playerStatus: Map<string, PlayerStatus>;
  isPlayerMuted: (playerId: Player["id"]) => boolean;
  onToggleMute: (playerId: Player["id"]) => void;
  getPlayerVolume: (playerId: Player["id"]) => number;
  onVolumeChange: (playerId: Player["id"], volume: number) => void;
  onRemoveBot: (playerId: Player["id"]) => void;
  onKickPlayer: (playerId: string[]) => void;
}) {
  return (
    <div className="mx-2 my-4 space-y-3 pb-4">
      {props.players.map((player) => {
        const isSelf = player.id === props.currentPlayerId;
        const status = props.playerStatus.get(player.id) ?? "Alive";
        const isAlive = status === "Alive";
        const isMuted = props.isPlayerMuted(player.id);

        return (
          <div
            key={player.id}
            className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100/50 p-3 shadow-sm backdrop-blur-sm"
          >
            <img
              src={getAvatarUrl(player.id || player.name || "player")}
              alt={`${player.name} avatar`}
              className={`h-10 w-10 rounded-full object-cover ${!isAlive ? "grayscale opacity-60" : ""}`}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-base-content">
                  {getTruncatedString(player.name, 16)}
                  {isSelf && <span className="text-base-content/50"> (You)</span>}
                </p>
                {player.isBot && <span className="badge badge-xs badge-ghost">BOT</span>}
                <span className={`badge badge-xs ${isAlive ? "badge-success" : "badge-error"}`}>
                  {isAlive ? "Alive" : "Dead"}
                </span>
                {player.connected === false && (
                  <span className="badge badge-xs badge-neutral">Disconnected</span>
                )}
              </div>

              {!isSelf && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={props.getPlayerVolume(player.id)}
                  disabled={isMuted}
                  onChange={(e) => props.onVolumeChange(player.id, Number(e.target.value))}
                  className="range range-xs range-primary mt-2 w-full"
                  aria-label={`${player.name} volume`}
                />
              )}
            </div>

            <button
              className={`btn btn-xs btn-circle ${isMuted ? "btn-error" : "btn-ghost"}`}
              onClick={() => props.onToggleMute(player.id)}
              aria-label={isMuted ? `Unmute ${player.name}` : `Mute ${player.name}`}
              title={isMuted ? `Unmute ${player.name}` : `Mute ${player.name}`}
            >
              {isMuted ? "🔇" : "🎤"}
            </button>

            {!isSelf && props.isHost && !props.gameStarted && (
              <button
                className="btn btn-xs btn-circle btn-ghost text-error"
                onClick={() => (player.isBot ? props.onRemoveBot(player.id) : props.onKickPlayer([player.id]))}
                aria-label={player.isBot ? `Remove ${player.name}` : `Kick ${player.name}`}
                title={player.isBot ? `Remove ${player.name}` : `Kick ${player.name}`}
              >
                ✕
              </button>
            )}
          </div>
        );
      })}

      {props.players.length === 0 && (
        <div className="rounded-xl border border-dashed border-base-300 bg-base-200/40 px-4 py-5 text-sm text-base-content/60">
          No players in the lobby yet.
        </div>
      )}
    </div>
  );
}
