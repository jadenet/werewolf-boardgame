import { getPlayerFromId } from "../helpers/lobby";
import { Round, Player, Action, Role } from "../types";

export default async function viewRole(
  round: Round,
  playerId: Player["id"],
  target: Action["target"],
  exclusions: Action["exclusions"],
) {
  const player = getPlayerFromId(playerId);
  if (player && player.socket) {
    player.socket
      .timeout(round.options.actionDuration * 1000)
      .emit(
        "viewRoleAction",
        target,
        exclusions,
        (err: Error, res: { playerRole: Role["id"] }) => {
          if (!err) {
            player.socket.emit("viewRoleResponse", res.playerRole);
          }
        },
      );
    setTimeout(() => {
      player.socket.emit("viewRoleActionEnd");
    }, round.options.actionDuration * 1000);
  }
}
