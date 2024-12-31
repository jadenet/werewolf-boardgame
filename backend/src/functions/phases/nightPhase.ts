import { getActionFunctionByName } from "../actions";
import { Ability, Player, Round } from "../Interfaces";

export default async function nightPhase(
  round: Round,
  abilities: { ability: Ability; players: Player[] }[][],
) {
  abilities.forEach((abilitiesArray) => {
    abilitiesArray.forEach((abilityPlayers) => {
      abilityPlayers.players.forEach((playerId) => {
        if (abilityPlayers.ability.actions.length > 1) {
        } else {
          abilityPlayers.ability.actions[0].forEach(async (action) => {
            const actionFunc = getActionFunctionByName(action.name);
            await actionFunc(round, playerId, action.target, action.exclusions);
          });
        }
      });
    });
  });
}
