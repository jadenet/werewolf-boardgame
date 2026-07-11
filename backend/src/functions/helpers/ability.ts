import { getPlayerFromId } from "./lobby";
import { validateAbility } from "../validator";
import { Ability, Action, AbilityPrompt, AbilityPromptResponse, AbilityResult, Player, Round } from "../types";
import { getPlayersByRole } from "./role";

function getRequiredSelections(target: Action["target"]) {
  switch (target) {
    case "Player":
      return 1;
    case "Player-Self":
      return 1;
    case "Player-Player":
      return 2;
    default:
      return 0;
  }
}

function getInstruction(ability: Ability, target: Action["target"], requiredSelections: number) {
  if (requiredSelections === 0) {
    return `Your ${ability.name} is resolving now.`;
  }

  if (requiredSelections === 1 && target === "Player-Self") {
    return `Use ${ability.name}: select one other player.`;
  }

  if (requiredSelections === 2) {
    return `Use ${ability.name}: select ${requiredSelections} players in order.`;
  }

  return `Use ${ability.name}: select ${requiredSelections} player${requiredSelections === 1 ? "" : "s"}.`;
}

export function emitAbilityResult(playerId: Player["id"], result: AbilityResult) {
  const player = getPlayerFromId(playerId);
  if (player?.socket) {
    player.socket.emit("abilityResult", result);
  }
}

export function getValidTargetIds(
  round: Round,
  playerId: Player["id"],
  target: Action["target"],
  exclusions: Action["exclusions"],
) {
  let validTargetIds = Array.from(round.playerRoles.keys());

  if (target === "Self") {
    validTargetIds = [playerId];
  }

  if (exclusions.includes("NotSelf")) {
    validTargetIds = validTargetIds.filter((candidateId) => candidateId !== playerId);
  }

  if (exclusions.includes("SelfOnly")) {
    validTargetIds = validTargetIds.filter((candidateId) => candidateId === playerId);
  }

  if (exclusions.includes("NotWerewolf")) {
    const werewolfIds = new Set(getPlayersByRole(round.playerRoles, "Werewolf"));
    validTargetIds = validTargetIds.filter((candidateId) => !werewolfIds.has(candidateId));
  }

  if (exclusions.includes("WerewolfOnly")) {
    const werewolfIds = new Set(getPlayersByRole(round.playerRoles, "Werewolf"));
    validTargetIds = validTargetIds.filter((candidateId) => werewolfIds.has(candidateId));
  }

  return validTargetIds;
}

export async function requestAbilityPrompt(
  round: Round,
  playerId: Player["id"],
  ability: Ability,
  action: Action,
) {
  const player = getPlayerFromId(playerId);
  if (!player?.socket) {
    return null;
  }

  const queue = ability.conditions?.queue ?? 0;
  const validation = validateAbility(
    playerId,
    round.playerRoles,
    round.playerStatus,
    ability,
    round.status,
    queue,
  );

  if (!validation.success) {
    emitAbilityResult(playerId, {
      abilityId: ability.id,
      title: ability.name,
      message: validation.message,
      tone: "warning",
    });
    return null;
  }

  const requiredSelections = getRequiredSelections(action.target);
  const validTargetIds = getValidTargetIds(round, playerId, action.target, action.exclusions);

  const configuredTimeoutMs = round.options?.actionDuration && round.options.actionDuration > 0
    ? round.options.actionDuration * 1000
    : 60_000;
  const remainingNightMs = round.phaseDeadlineAt ? round.phaseDeadlineAt - Date.now() : configuredTimeoutMs;
  const promptTimeoutMs = Math.max(1, Math.min(configuredTimeoutMs, remainingNightMs));

  if (requiredSelections === 0) {
    emitAbilityResult(playerId, {
      abilityId: ability.id,
      title: ability.name,
      message: getInstruction(ability, action.target, requiredSelections),
      tone: "info",
    });
    return [];
  }

  const prompt: AbilityPrompt = {
    abilityId: ability.id,
    abilityName: ability.name,
    message: getInstruction(ability, action.target, requiredSelections),
    target: action.target,
    exclusions: action.exclusions,
    queue,
    requiredSelections,
    validTargetIds,
  };

  return new Promise<Player["id"][] | null>((resolve) => {
    player.socket
      .timeout(promptTimeoutMs)
      .emit("abilityPrompt", prompt, (err: Error | null, response?: AbilityPromptResponse) => {
        if (err || !response) {
          emitAbilityResult(playerId, {
            abilityId: ability.id,
            title: ability.name,
            message: `${ability.name} timed out.`,
            tone: "warning",
          });
          resolve(null);
          return;
        }

        const selectedPlayerIds = Array.from(new Set(response.selectedPlayerIds));
        const isValidCount = selectedPlayerIds.length === requiredSelections;
        const isValidTargets = selectedPlayerIds.every((selectedPlayerId) => {
          return validTargetIds.includes(selectedPlayerId);
        });

        if (!isValidCount || !isValidTargets) {
          emitAbilityResult(playerId, {
            abilityId: ability.id,
            title: ability.name,
            message: `Invalid selection for ${ability.name}.`,
            tone: "warning",
          });
          resolve(null);
          return;
        }

        resolve(selectedPlayerIds);
      });
  });
}