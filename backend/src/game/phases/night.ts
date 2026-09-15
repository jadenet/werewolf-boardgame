import {
  getActionFunctionByName,
  getPlayersByAbility,
} from "../helpers/action";
import { Round, Player, Role, Ability } from "../types";
import { getPlayerFromId } from "../../lobby/lobby";
import { validateAbility } from "../validator";
import abilities from "../../assets/abilities.json";

export default async function nightPhase(round: Round) {
  const configuredNightDuration = round.options?.actionDuration;
  const nightDuration = Number.isFinite(configuredNightDuration) && configuredNightDuration > 0
    ? configuredNightDuration
    : 60;
  round.phaseDeadlineAt = Date.now() + nightDuration * 1000;

  // Emit night start to all players
  round.playerRoles.forEach((_: Role["id"][], playerId: Player["id"]) => {
    const player = getPlayerFromId(playerId);
    if (player && player.socket) {
      player.socket.emit("startNight", nightDuration);
    }
  });

  const queuedAbilities = ([...abilities] as Ability[]).sort((a, b) => (a.conditions?.queue || 0) - (b.conditions?.queue || 0));

  let timedOut = false;

  // Process abilities in order
  for (const ability of queuedAbilities) {
    if (Date.now() >= (round.phaseDeadlineAt ?? 0)) {
      timedOut = true;
      break;
    }

    const playersWithAbility = getPlayersByAbility(
      round.playerRoles,
      ability.id,
    );

    for (const playerId of playersWithAbility) {
      if (Date.now() >= (round.phaseDeadlineAt ?? 0)) {
        timedOut = true;
        break;
      }

      // Skip silently for players the ability doesn't currently apply to (e.g. lone wolf
      // when there are multiple werewolves alive), instead of prompting/rejecting them.
      const queue = ability.conditions?.queue ?? 0;
      const validation = validateAbility(playerId, round.playerRoles, round.playerStatus, ability, round.status, queue);
      if (!validation.success) {
        continue;
      }

      if (ability.actions.length > 1) {
        // Handle multi-action abilities
        for (const actionGroup of ability.actions) {
          if (Date.now() >= (round.phaseDeadlineAt ?? 0)) {
            timedOut = true;
            break;
          }

          for (const action of actionGroup) {
            const actionFunc = getActionFunctionByName(action.type);
            if (actionFunc) {
              try {
                await actionFunc(round, playerId, ability, action);
              } catch (error) {
                console.error("Night action failed", {
                  abilityId: ability.id,
                  actionType: action.type,
                  playerId,
                  error,
                });
              }
            }
          }
        }
      } else if (ability.actions.length === 1) {
        // Handle single action abilities
        for (const action of ability.actions[0]) {
          if (Date.now() >= (round.phaseDeadlineAt ?? 0)) {
            timedOut = true;
            break;
          }

          const actionFunc = getActionFunctionByName(action.type);
          if (actionFunc) {
            try {
              await actionFunc(round, playerId, ability, action);
            } catch (error) {
              console.error("Night action failed", {
                abilityId: ability.id,
                actionType: action.type,
                playerId,
                error,
              });
            }
          }
        }
      }

      if (timedOut) {
        break;
      }
    }

    if (timedOut) {
      break;
    }
  }

  // Ensure night lasts at most its configured duration from the initial start signal.
  const remainingMs = (round.phaseDeadlineAt ?? Date.now()) - Date.now();
  if (remainingMs > 0) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, remainingMs);
    });
  }

  round.phaseDeadlineAt = undefined;
}
