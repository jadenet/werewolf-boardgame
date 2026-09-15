import { emitAbilityResult, requestAbilityPrompt } from "../services/ability";
import { getPlayerFromId } from "../../lobby/lobby";
import { getCenterRoleId, setCenterRoleId } from "../services/center";
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

  if (action.target === "Self-Center") {
    const centerCardId = selectedPlayerIds[0];
    if (!centerCardId) {
      return;
    }

    const ownRole = round.playerRoles.get(playerId) ?? [];
    const centerRole = getCenterRoleId(round, centerCardId);
    setCenterRoleId(round, centerCardId, ownRole[0]);
    round.playerRoles.set(playerId, centerRole ? [centerRole] : []);

    emitAbilityResult(playerId, {
      abilityId: ability.id,
      title: ability.name,
      message: "You swapped your card with a card from the center, without looking at either.",
      tone: "success",
    });
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
