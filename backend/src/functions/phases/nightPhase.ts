import { getActionFunctionByName } from "../actions";
import { Ability, Player, Round } from "../Interfaces";

export default async function nightPhase(
  round: Round,
  abilities: { ability: Ability; players: Player[] }[][],
) {
  // Emit night start to all players
  round.playerRoles.forEach((_, player) => {
    if (player.socket) {
      player.socket.emit("startNight", round.options.actionDuration);
    }
  });

  // Process abilities in order
  for (const abilityGroup of abilities) {
    for (const abilityPlayers of abilityGroup) {
      const ability = abilityPlayers.ability;
      const players = abilityPlayers.players;

      // For each player with this ability
      for (const player of players) {
        if (ability.actions.length > 1) {
          // Handle multi-action abilities
          for (const actionGroup of ability.actions) {
            for (const action of actionGroup) {
              const actionFunc = getActionFunctionByName(action.name);
              if (actionFunc) {
                await actionFunc(round, player, action.target, action.exclusions);
              }
            }
          }
        } else if (ability.actions.length === 1) {
          // Handle single action abilities
          for (const action of ability.actions[0]) {
            const actionFunc = getActionFunctionByName(action.name);
            if (actionFunc) {
              await actionFunc(round, player, action.target, action.exclusions);
            }
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
