import { emitAbilityResult, requestAbilityPrompt } from "../services/ability";
import { getPlayersByRole } from "../services/role";
import { getPlayerFromId } from "../../lobby/lobby";
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

  // Werewolf identities are shown as a persistent badge on their player cards instead of
  // being spelled out in the (transient, but still logged) ability result message.
  const isWerewolfReveal = action.target === "Werewolf";

  emitAbilityResult(playerId, {
    abilityId: ability.id,
    title: ability.name,
    message: playerNames.length === 0
      ? `No other ${action.target} players were found.`
      : isWerewolfReveal
        ? "Check the wolf icons on player cards to see who's with you."
        : `${action.target}: ${playerNames.join(", ")}`,
    tone: "info",
    revealedPlayerIds: playersWithRole,
  });
}
