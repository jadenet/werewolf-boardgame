import { emitAbilityResult, requestAbilityPrompt } from "../services/ability";
import { Round, Player, Team, Ability, Action } from "../types";
import { getPlayersByTeam } from "../services/role";
import { getPlayerFromId } from "../../lobby/lobby";

export default async function viewTeam(
  round: Round,
  playerId: Player["id"],
  ability: Ability,
  action: Action,
) {
  const selectedPlayerIds = await requestAbilityPrompt(round, playerId, ability, action);
  if (selectedPlayerIds === null) {
    return;
  }

  const targetTeam = action.target as Team;
  const playersInTeam = getPlayersByTeam(round.playerRoles, targetTeam);
  const playerIndexIfInTeam = playersInTeam.indexOf(playerId);
  if (playerIndexIfInTeam !== -1) {
    playersInTeam.splice(playerIndexIfInTeam, 1);
  }

  const playerNames = playersInTeam
    .map((targetPlayerId) => getPlayerFromId(targetPlayerId)?.name)
    .filter((playerName): playerName is string => Boolean(playerName));

  emitAbilityResult(playerId, {
    abilityId: ability.id,
    title: ability.name,
    message: playerNames.length > 0
      ? `${targetTeam}: ${playerNames.join(", ")}`
      : `No other players from ${targetTeam} were found.`,
    tone: "info",
  });
}
