import { Player } from "@/Interfaces";

export default function getPlayerFromPlayerId(
  players: Player[],
  playerId: Player["id"]
) {
  return players.find((player) => {
    return player.id === playerId;
  });
}
