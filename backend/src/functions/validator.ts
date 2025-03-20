import { Ability, ErrorResponse, Player, Round } from "./Interfaces";
import { findPlayersWithRole } from "./roles";

export function validateDiscussionSkip(
  discussionSkips: Player[],
  player: Player
) {
  return !discussionSkips.includes(player);
}

export function validateLynchingVote(
  player: Player,
  targetPlayer: Player,
  phase: Round["status"]
) {
  return (
    player !== targetPlayer && phase === "Voting"
  );
}

export function validateAbility(
  player: Player,
  playerRoles: Round["playerRoles"],
  playerStatus: Round["playerStatus"],
  ability: Ability,
  phase: Round["status"],
  queue: number
) {
  let valid: ErrorResponse = {
    success: false,
    message: "",
    timestamp: Date.now(),
  };

  const roles = playerRoles.get(player);

  if (!roles || !roles[0].abilities.includes(ability.name)) {
    valid.message = "You do not have access to this ability!";
    return valid;
  }

  if (ability.conditions) {
    const phaseCondition = ability.conditions.phase;
    const queueCondition = ability.conditions.queue;
    const statusCondition = ability.conditions.playerStatus;
    const otherCondition = ability.conditions.other;

    const status = playerStatus.get(player);
    let otherConditionValid = true;

    if (otherCondition) {
      switch (otherCondition) {
        case "SoleWerewolf":
          const werewolfPlayers = findPlayersWithRole(playerRoles, "Werewolf");

          if (werewolfPlayers.length != 1 || werewolfPlayers[0] != player) {
            otherConditionValid = false;
          }
          break;
        default:
          break;
      }
    }

    if (
      (phaseCondition && phaseCondition != phase) ||
      (queueCondition && queueCondition != queue) ||
      (statusCondition && statusCondition != status) ||
      !otherConditionValid
    ) {
      valid.message = "You cannot play this ability yet!";
      return valid;
    }
  }

  valid.success = true;
  return valid;
}
