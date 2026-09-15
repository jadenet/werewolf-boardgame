import { Lobby, Player } from "../game/types";
import { getRoleById } from "../game/services/role";

type AckCallback = (...args: any[]) => void;

const MIN_DECISION_DELAY_MS = 2000;
const MAX_DECISION_DELAY_MS = 6000;

function randomDecisionDelay() {
  return MIN_DECISION_DELAY_MS + Math.random() * (MAX_DECISION_DELAY_MS - MIN_DECISION_DELAY_MS);
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) {
    return undefined;
  }
  return items[Math.floor(Math.random() * items.length)];
}

// A drop-in replacement for a socket.io `Socket` that lets bot players participate
// in the same code paths real players use (discussion skips, voting, ability prompts),
// by making its own decisions instead of waiting for real client input.
export default class BotSocket {
  private lobby: Lobby;
  private playerId: Player["id"];

  constructor(lobby: Lobby, playerId: Player["id"]) {
    this.lobby = lobby;
    this.playerId = playerId;
  }

  private currentRound() {
    return this.lobby.rounds[this.lobby.rounds.length - 1];
  }

  // Prefers voting for a player on the opposing team when the bot knows its own role.
  private pickVoteTarget(): Player["id"] | undefined {
    const round = this.currentRound();
    const alivePlayerIds = this.lobby.players.filter((id) => {
      return id !== this.playerId && (!round || round.playerStatus.get(id) !== "Dead");
    });

    if (!round) {
      return pickRandom(alivePlayerIds);
    }

    const ownRoleId = round.playerRoles.get(this.playerId)?.[0];
    const ownTeam = getRoleById(ownRoleId)?.team;

    if (ownTeam === "Werewolves") {
      const nonWerewolfIds = alivePlayerIds.filter((id) => {
        const roleId = round.playerRoles.get(id)?.[0];
        return getRoleById(roleId)?.team !== "Werewolves";
      });
      return pickRandom(nonWerewolfIds) ?? pickRandom(alivePlayerIds);
    }

    return pickRandom(alivePlayerIds);
  }

  // Bots don't need to react to fire-and-forget broadcast events.
  on(_event: string, _callback: (...args: any[]) => void) {}

  once(event: string, callback: AckCallback) {
    if (event === "discussionSkip") {
      setTimeout(() => callback(), randomDecisionDelay());
      return;
    }

    if (event === "vote") {
      setTimeout(() => {
        const targetId = this.pickVoteTarget();
        if (targetId) {
          callback(targetId);
        }
      }, randomDecisionDelay());
      return;
    }

    if (event === "playAgainVote") {
      setTimeout(() => callback(), randomDecisionDelay());
      return;
    }
  }

  // Plain fire-and-forget emits (e.g. ability results, phase/timer updates) are ignored.
  emit(_event: string, ..._args: any[]) {}

  // Mirrors socket.io's `socket.timeout(ms).emit(event, payload, callback)`, used for ability prompts.
  timeout(_ms: number) {
    return {
      emit: (event: string, payload: any, callback: AckCallback) => {
        if (event !== "abilityPrompt") {
          return;
        }

        setTimeout(() => {
          const requiredSelections: number = payload?.requiredSelections ?? 0;
          const validTargetIds: Player["id"][] = payload?.validTargetIds ?? [];

          if (requiredSelections <= 0 || validTargetIds.length === 0) {
            callback(null, { selectedPlayerIds: [] });
            return;
          }

          const shuffledTargetIds = [...validTargetIds].sort(() => Math.random() - 0.5);
          callback(null, { selectedPlayerIds: shuffledTargetIds.slice(0, requiredSelections) });
        }, randomDecisionDelay());
      },
    };
  }
}
