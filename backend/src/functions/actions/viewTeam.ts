import { Round, Player, Team } from "../types";
import { getPlayersByTeam } from "../helpers/role";
import { getPlayerFromId } from "../helpers/lobby";

export default async function viewTeam(
  round: Round,
  playerId: Player["id"],
  target: Team,
) {
  const playersInTeam = getPlayersByTeam(round.playerRoles, target);
  const playerIndexIfInTeam = playersInTeam.indexOf(playerId);
  if (playerIndexIfInTeam !== -1) {
    playersInTeam.splice(playerIndexIfInTeam, 1);
  }

  const player = getPlayerFromId(playerId);
  if (player && player.socket) {
    player.socket.emit("viewTeamAction", playersInTeam);
    setTimeout(() => {
      player.socket.emit("viewTeamActionEnd");
    }, round.options.actionDuration * 1000);
  }
}
