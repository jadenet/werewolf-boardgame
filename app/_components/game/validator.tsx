export function validateWerewolfVote(player, targetPlayer) {
  // check phase time too
  if (
    player.status === "Alive" &&
    targetPlayer.status === "Alive" &&
    player.team === "Werewolves" &&
    targetPlayer.team !== "Werewolves"
  ) {
    // add werewolf vote, check for alpha
  }

  return true
}

export function validateLynchingVote(player, targetPlayer) {
  // check phase time
  // check if player is blocked
  if (player.status === "Alive" && targetPlayer.status === "Alive") {
    // add vote, check for mayor or added votes
  }

  return true
}

export function validateAbility(player, ability, phase) {
  let valid = true;

  ability.conditions.map((conditionKey, conditionValue) => {
    switch (conditionKey) {
      case "phase":
        valid = conditionValue === phase;
        break;

      default:
        break;
    }
  });
  valid = player.status === "Alive";

  return valid;
}
