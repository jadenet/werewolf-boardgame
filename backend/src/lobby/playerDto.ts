import { getPlayerFromId } from "./lobby";
import { Player } from "../game/types";

// Shape sent to clients; never expose the raw player object (e.g. its socket).
export function toPlayerDTO(playerId: Player["id"]) {
  const player = getPlayerFromId(playerId);
  if (!player) return { id: playerId, name: "Unknown", isBot: false, connected: false };
  return {
    id: player.id,
    name: player.name,
    isBot: Boolean(player.isBot),
    connected: player.connected !== false,
  };
}
