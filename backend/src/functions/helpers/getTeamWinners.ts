import getHighestVotes from "./getHighestVotes";
import { Player, PlayerStatus, Role, Round, Team } from "../types";
import { getPlayersByRole, getRoleById } from "./role";

export default function getTeamWinners(
  lynchVotes: Map<Player["id"], Player["id"]>,
  playerRoles: Map<Player["id"], Role["id"][]>,
  playerStatus: Map<Player["id"], PlayerStatus>,
) {
  const highestVotedPlayers = getHighestVotes(lynchVotes);
  const eliminatedPlayers: Player["id"][] = [];
  const teamWinners: Round["teamWinner"] = [];
  const werewolfPlayers = getPlayersByRole(playerRoles, "Werewolf");
  let tannerEliminations = 0;
  let werewolfEliminations = 0;
  let villagerEliminations = 0;

  if (highestVotedPlayers.length === 1) {
    playerStatus.set(highestVotedPlayers[0], "Dead");
    eliminatedPlayers.push(highestVotedPlayers[0]);
  }

  eliminatedPlayers.forEach((playerId: Player["id"]) => {
    const playerRole = getRoleById(playerRoles.get(playerId)?.[0]);

    if (playerRole?.name === "Tanner") {
      tannerEliminations++;
    }

    switch (playerRole?.member) {
      case "Werewolf":
        werewolfEliminations++;
        break;
      case "Villager":
        villagerEliminations++;
        break;
      default:
        break;
    }
  });

  const teamWinningConditions = {
    Villagers: werewolfPlayers.length === 0 && eliminatedPlayers.length > 0,
    Werewolves: werewolfPlayers.length > 0 && werewolfEliminations === 0,
    Solo: tannerEliminations > 0,
  };

  for (const team in teamWinningConditions) {
    if (teamWinningConditions[team as Team]) {
      teamWinners.push(team as Team);
    }
  }

  return teamWinners;
}
