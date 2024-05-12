export function validateWerewolfVote(
  player: { status: string; team: string },
  targetPlayer: { status: string; team: string },
  phase: string
) {
  if (
    player !== targetPlayer && 
    player.status === "Alive" &&
    targetPlayer.status === "Alive" &&
    player.team.includes("Werewolves") &&
    !targetPlayer.team.includes("Werewolves") &&
    phase === "Night"
  ) {
    return true;
    // check for alpha
  }
}

export function validateLynchingVote(
  player: { status: string },
  targetPlayer: { status: string },
  phase: string
) {
  // check if player is blocked
  if (
    player !== targetPlayer &&
    player.status === "Alive" &&
    targetPlayer.status === "Alive" &&
    phase === "Voting"
  ) {
    // add vote, check for mayor or added votes
    return true;
  }
}

export function validateAbility(
  player: { status: string },
  ability: { conditions: any[] },
  phase: any
) {
  let valid = true;

  ability.conditions.map((conditionKey: any, conditionValue: any) => {
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
