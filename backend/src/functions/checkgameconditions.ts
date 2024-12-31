import getHighestVotes from "./getHighestVotes";
import { Player, Role, Round } from "./Interfaces";
import { findPlayersWithRole } from "./roles";

export default function checkGameConditions(
  lynchVotes: Map<Player, Player>,
  playerRoles: Map<Player, Role[]>,
  playerStatus: Map<Player, "Alive" | "Dead">
) {
  const highestVotedPlayers = getHighestVotes(lynchVotes);
  highestVotedPlayers.forEach((player) => {
    playerStatus.set(player, "Dead");
  });

  const eliminatedPlayers: Player[] = [];
  playerStatus.forEach((status, player) => {
    if (status === "Dead") {
      eliminatedPlayers.push(player);
    }
  });

  let teamWinner: Round["teamWinner"] = [];

  const werewolfPlayers = findPlayersWithRole(playerRoles, "Werewolf");
  let werewolfEliminations = 0,
    tannerELiminations = 0,
    villagerEliminations = 0;

  eliminatedPlayers.forEach((player: Player) => {
    const playerRole = playerRoles.get(player)?.at(-1);

    if (playerRole?.name === "Tanner") {
      tannerELiminations++;
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

  if (tannerELiminations > 0) {
    teamWinner.push("Tanner");
  }

  if (
    (werewolfPlayers.length === 0 && eliminatedPlayers.length === 0) ||
    werewolfEliminations > 0
  ) {
    teamWinner.push("Villagers");
  }

  if (werewolfPlayers.length > 0 && werewolfEliminations === 0) {
    teamWinner.push("Werewolves");
  }

  return teamWinner;
}
