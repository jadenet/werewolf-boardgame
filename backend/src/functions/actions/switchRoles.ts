import { getPlayerFromId } from "../helpers/lobby";
import { Round, Player, Role, Action } from "../types";

export function switchRoles(
  playerTarget1: Player["id"],
  playerTarget2: Player["id"],
  playerRoles: Map<Player["id"], Role["id"][]>,
) {
  const temp = playerRoles.get(playerTarget1);
  playerRoles.set(playerTarget1, playerRoles.get(playerTarget2) ?? []);
  playerRoles.set(playerTarget2, temp ?? []);
}

export default async function switchAction(
  round: Round,
  playerId: Player["id"],
  playerRoles: Map<Player["id"], Role["id"][]>,
  target: Action["target"],
  exclusions: Action["exclusions"],
) {
  const player = getPlayerFromId(playerId);
  if (player && player.socket) {
    player.socket
      .timeout(round.options.actionDuration * 1000)
      .emit(
        "switchAction",
        target,
        exclusions,
        (
          err: Error,
          res: { playerTarget1: Player["id"]; playerTarget2: Player["id"] },
        ) => {
          if (!err) {
            switchRoles(res.playerTarget1, res.playerTarget2, playerRoles);
          }
        },
      );
    setTimeout(() => {
      player.socket.emit("switchActionEnd");
    }, round.options.actionDuration * 1000);
  }
}
