import { requestAbilityPrompt, emitAbilityResult } from "../services/ability";
import { getRoleById } from "../services/role";
import { getPlayerFromId } from "../../lobby/lobby";
import { getCenterCardLabel, getCenterRoleId, isCenterCardId } from "../services/center";
import { Round, Player, Ability, Action } from "../types";

export default async function viewRole(
  round: Round,
  playerId: Player["id"],
  ability: Ability,
  action: Action,
) {
  const selectedIds = await requestAbilityPrompt(round, playerId, ability, action);
  if (selectedIds === null) {
    return;
  }

  const targetIds = action.target === "Self" ? [playerId] : selectedIds;

  const revealedSentences = targetIds.map((targetId) => {
    const roleId = isCenterCardId(targetId)
      ? getCenterRoleId(round, targetId)
      : round.playerRoles.get(targetId)?.[0];
    const role = getRoleById(roleId);

    const label = isCenterCardId(targetId)
      ? getCenterCardLabel(targetId)
      : targetId === playerId
        ? "Your"
        : `${getPlayerFromId(targetId)?.name ?? "That player"}'s`;

    return role ? `${label} role is a ${role.name}.` : `${label} role could not be found.`;
  });

  emitAbilityResult(playerId, {
    abilityId: ability.id,
    title: ability.name,
    message: revealedSentences.join(" "),
    tone: "success",
  });
}

