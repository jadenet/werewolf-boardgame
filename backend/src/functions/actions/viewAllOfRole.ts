import { emitAbilityResult, requestAbilityPrompt } from "../helpers/ability";
import { getPlayersByRole } from "../helpers/role";
import { getPlayerFromId } from "../helpers/lobby";
import { Round, Player, Action, Ability } from "../types";

export default async function viewAllOfRole(
  round: Round,
  playerId: Player["id"],
  ability: Ability,
  action: Action,
) {
  const selectedPlayerIds = await requestAbilityPrompt(round, playerId, ability, action);
  if (selectedPlayerIds === null) {
    return;
  }

  const playersWithRole = getPlayersByRole(round.playerRoles, action.target);
  const playerIndexIfIsRole = playersWithRole.indexOf(playerId);
  if (playerIndexIfIsRole !== -1) {
    playersWithRole.splice(playerIndexIfIsRole, 1);
  }

  const playerNames = playersWithRole
    .map((targetPlayerId) => getPlayerFromId(targetPlayerId)?.name)
    .filter((playerName): playerName is string => Boolean(playerName));

  emitAbilityResult(playerId, {
    abilityId: ability.id,
    title: ability.name,
    message: playerNames.length > 0
      ? `${action.target}: ${playerNames.join(", ")}`
      : `No other ${action.target} players were found.`,
    tone: "info",
  });
}
