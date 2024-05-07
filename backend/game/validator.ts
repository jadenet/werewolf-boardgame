export function validateWerewolfVote(
  player: { status: string; team: string },
  targetPlayer: { status: string; team: string }
) {
  // check phase time too
  if (
    player.status === "Alive" &&
    targetPlayer.status === "Alive" &&
    player.team === "Werewolves" &&
    targetPlayer.team !== "Werewolves"
  ) {
    console.log("sweet");

    return true;
    // check for alpha
  } else {
    ("weird one");
  }
}

export function validateLynchingVote(
  player: { status: string },
  targetPlayer: { status: string }
) {
  // check phase time
  // check if player is blocked
  if (player.status === "Alive" && targetPlayer.status === "Alive") {
    // add vote, check for mayor or added votes
  }

  return true;
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
