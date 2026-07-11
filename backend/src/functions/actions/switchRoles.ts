import { emitAbilityResult, requestAbilityPrompt } from "../helpers/ability";
import { getPlayerFromId } from "../helpers/lobby";
import { Round, Player, Role, Action, Ability } from "../types";

export function switchRoles(
  playerTarget1: Player["id"],
  playerTarget2: Player["id"],
  playerRoles: Map<Player["id"], Role["id"][]>,
) {
  const temp = playerRoles.get(playerTarget1);
  playerRoles.set(playerTarget1, playerRoles.get(playerTarget2) ?? []);
  playerRoles.set(playerTarget2, temp ?? []);
}

export default async function switchAction(
  round: Round,
  playerId: Player["id"],
  ability: Ability,
  action: Action,
) {
  const player = getPlayerFromId(playerId);
  if (!player?.socket) {
    return;
  }

  const selectedPlayerIds = await requestAbilityPrompt(round, playerId, ability, action);
  if (selectedPlayerIds === null) {
    return;
  }

  if (action.target === "Player-Self") {
    const targetPlayerId = selectedPlayerIds[0];
    if (!targetPlayerId) {
      return;
    }

    switchRoles(playerId, targetPlayerId, round.playerRoles);
    emitAbilityResult(playerId, {
      abilityId: ability.id,
      title: ability.name,
      message: "You swapped roles with another player.",
      tone: "success",
    });
    return;
  }

  if (action.target === "Player-Player") {
    const [firstTargetId, secondTargetId] = selectedPlayerIds;
    if (!firstTargetId || !secondTargetId) {
      return;
    }

    switchRoles(firstTargetId, secondTargetId, round.playerRoles);
    emitAbilityResult(playerId, {
      abilityId: ability.id,
      title: ability.name,
      message: "You swapped the selected players' roles.",
      tone: "success",
    });
  }
}
