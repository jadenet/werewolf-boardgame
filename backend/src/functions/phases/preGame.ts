import { Options, Player, Role } from "../Interfaces";

export default async function preGame(
  players: Player[],
  playerRoles: Map<Player, Role[]>,
  preGameDuration: Options["preGameDuration"]
) {
  players.forEach((player) => {
    const roles = playerRoles.get(player);
    if (roles) {
      player.socket.emit("shareRole", roles[0]);
    }
  });

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, preGameDuration * 1000);
  });
}
