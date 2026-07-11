import { Player, Role, Options } from "../types";

export default async function preGame(
  _players: Player["id"][],
  _playerRoles: Map<Player["id"], Role["id"][]>,
  preGameDuration: Options["preGameDuration"]
) {
  // Role sharing is handled in playGame with full role data.

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, preGameDuration * 1000);
  });
}