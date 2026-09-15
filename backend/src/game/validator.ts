import { Ability, ErrorResponse, Player, Round } from "./types";
import { getPlayersByRole, getRoleById } from "./services/role";

export function validateDiscussionSkip(
  discussionSkips: Player["id"][],
  playerId: Player["id"]
) {
  return !discussionSkips.includes(playerId);
}

export function validateLynchingVote(
  playerId: Player["id"],
  targetPlayerId: Player["id"],
  phase: Round["status"]
) {
  return (
    playerId !== targetPlayerId && phase === "Voting"
  );
}

export function validateAbility(
  playerId: Player["id"],
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

  const roles = playerRoles.get(playerId);

  if (!roles || !getRoleById(roles[0]) || !getRoleById(roles[0])!.abilities.includes(ability.id)) {
    valid.message = "You do not have access to this ability!";
    return valid;
  }

  if (ability.conditions) {
    const phaseCondition = ability.conditions.phase;
    const queueCondition = ability.conditions.queue;
    const statusCondition = ability.conditions.playerStatus;
    const otherConditions = Array.isArray(ability.conditions.other)
      ? ability.conditions.other
      : ability.conditions.other
        ? [ability.conditions.other]
        : [];

    const status = playerStatus.get(playerId);
    let otherConditionValid = true;

    for (const otherCondition of otherConditions) {
      switch (otherCondition) {
        case "SoleWerewolf": {
          const werewolfPlayers = getPlayersByRole(playerRoles, "Werewolf");

          if (werewolfPlayers.length != 1 || werewolfPlayers[0] != playerId) {
            otherConditionValid = false;
          }
          break;
        }
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
