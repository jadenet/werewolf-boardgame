import { requestAbilityPrompt, emitAbilityResult } from "../helpers/ability";
import { getRoleById } from "../helpers/role";
import { Round, Player, Ability, Action } from "../types";

export default async function viewRole(
  round: Round,
  playerId: Player["id"],
  ability: Ability,
  action: Action,
) {
  const selectedPlayerIds = await requestAbilityPrompt(round, playerId, ability, action);
  if (selectedPlayerIds === null) {
    return;
  }

  const targetPlayerId = action.target === "Self" ? playerId : selectedPlayerIds[0] ?? playerId;
  const roleId = round.playerRoles.get(targetPlayerId)?.[0];
  const role = getRoleById(roleId);

  if (!role) {
    emitAbilityResult(playerId, {
      abilityId: ability.id,
      title: ability.name,
      message: "No role information was found.",
      tone: "warning",
    });
    return;
  }

  emitAbilityResult(playerId, {
    abilityId: ability.id,
    title: ability.name,
    message: targetPlayerId === playerId
      ? `Your role is ${role.name}.`
      : `That player's role is ${role.name}.`,
    tone: "success",
  });
}
