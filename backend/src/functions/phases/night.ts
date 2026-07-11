import {
  getActionFunctionByName,
  getPlayersByAbility,
} from "../helpers/action";
import { Round, Player, Role } from "../types";
import { getPlayerFromId } from "../helpers/lobby";
import abilities from "../../assets/abilities.json";

export default async function nightPhase(round: Round) {
  // Emit night start to all players
  round.playerRoles.forEach((_: Role["id"][], playerId: Player["id"]) => {
    const player = getPlayerFromId(playerId);
    if (player && player.socket) {
      player.socket.emit("startNight", round.options.actionDuration);
    }
  });

  abilities.sort((a, b) => (a.conditions?.queue || 0) - (b.conditions?.queue || 0));

  // Process abilities in order
  for (const ability of abilities) {
    const playersWithAbility = getPlayersByAbility(
      round.playerRoles,
      ability.id,
    );

    for (const playerId of playersWithAbility) {
      if (ability.actions.length > 1) {
        // Handle multi-action abilities
        for (const actionGroup of ability.actions) {
          for (const action of actionGroup) {
            const actionFunc = getActionFunctionByName(action.type);
            if (actionFunc) {
              await actionFunc(round, playerId, ability, action);
            }
          }
        }
      } else if (ability.actions.length === 1) {
        // Handle single action abilities
        for (const action of ability.actions[0]) {
          const actionFunc = getActionFunctionByName(action.type);
          if (actionFunc) {
            await actionFunc(round, playerId, ability, action);
          }
        }
      }
    }
  }

  // Wait for night duration
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, round.options.actionDuration * 1000);
  });
}
