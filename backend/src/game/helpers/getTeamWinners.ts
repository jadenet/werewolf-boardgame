import getHighestVotes from "./getHighestVotes";
import { Player, PlayerStatus, Role, Round, Team } from "../types";
import { getPlayersByRole, getRoleById } from "../services/role";

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

  const eliminate = (playerId: Player["id"]) => {
    if (playerStatus.get(playerId) === "Dead") {
      return;
    }

    playerStatus.set(playerId, "Dead");
    eliminatedPlayers.push(playerId);

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
  };

  if (highestVotedPlayers.length === 1) {
    eliminate(highestVotedPlayers[0]);
  }

  // The Hunter takes their vote target down with them if they're voted out.
  eliminatedPlayers.slice().forEach((eliminatedPlayerId) => {
    const eliminatedRole = getRoleById(playerRoles.get(eliminatedPlayerId)?.[0]);
    if (eliminatedRole?.name !== "Hunter") {
      return;
    }

    const huntersTarget = lynchVotes.get(eliminatedPlayerId);
    if (huntersTarget) {
      eliminate(huntersTarget);
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
