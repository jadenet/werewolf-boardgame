import { getPlayerFromId } from "../helpers/lobby";
import { Player, Role, Options } from "../types";

export default async function preGame(
  players: Player["id"][],
  playerRoles: Map<Player["id"], Role["id"][]>,
  preGameDuration: Options["preGameDuration"]
) {
  players.forEach((playerId) => {
    const roles = playerRoles.get(playerId);
    if (roles) {
      const player = getPlayerFromId(playerId);
      if (player && player.socket) {
        player.socket.emit("shareRole", roles[0]);
      }
    }
  });

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, preGameDuration * 1000);
  });
}