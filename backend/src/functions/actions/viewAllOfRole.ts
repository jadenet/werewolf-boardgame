import { Round, Player, Action } from "../types";
import { getPlayersByRole } from "../helpers/role";
import { getPlayerFromId } from "../helpers/lobby";

export default async function viewAllOfRole(
  round: Round,
  playerId: Player["id"],
  target: Action["target"],
) {
  const playersWithRole = getPlayersByRole(round.playerRoles, target);
  const playerIndexIfIsRole = playersWithRole.indexOf(playerId);
  if (playerIndexIfIsRole !== -1) {
    playersWithRole.splice(playerIndexIfIsRole, 1);
  }

  const player = getPlayerFromId(playerId);
  if (player && player.socket) {
    player.socket.emit("viewAllOfRoleAction", playersWithRole);
    setTimeout(() => {
      player.socket.emit("viewAllOfRoleActionEnd");
    }, round.options.actionDuration * 1000);
  }
}
