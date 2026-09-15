import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Socket } from "socket.io-client";
import {
  AbilityPrompt,
  AbilityPromptResponse,
  AbilityResult,
  Player,
  PlayerStatus,
  Role,
  Round,
  VoteStatus,
} from "../../Interfaces";

const WEREWOLF_REVEAL_ABILITY_IDS = ["werewolf-ability", "minion-ability", "lone-wolf-ability"];

type PendingAbilityAckRef = MutableRefObject<((response: AbilityPromptResponse) => void) | null>;
type RoleSummary = { name: string; img: string };

function startPhaseCountdown(setPhaseDeadline: Dispatch<SetStateAction<number | null>>, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) {
    setPhaseDeadline(null);
    return;
  }

  setPhaseDeadline(Date.now() + duration * 1000);
}

// Wires up connection lifecycle events (connect/disconnect/error) for the lobby socket.
export function registerConnectionEvents(
  socket: Socket,
  serverUrl: string,
  setters: {
    setSocketConnected: Dispatch<SetStateAction<boolean>>;
    setPhaseDeadline: Dispatch<SetStateAction<number | null>>;
    setActiveAbilityPrompt: Dispatch<SetStateAction<AbilityPrompt | null>>;
    setSelectedAbilityTargets: Dispatch<SetStateAction<Player["id"][]>>;
    pendingAbilityPromptAckRef: PendingAbilityAckRef;
  }
) {
  socket.on("connect_error", (error) => {
    console.error("Socket connect error:", error);
    console.error("Socket URL:", serverUrl);
    console.error("Error message:", error.message);
    setters.setSocketConnected(false);
  });

  socket.on("connect", () => {
    console.log("Socket connected successfully to:", serverUrl);
    setters.setSocketConnected(true);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    setters.setSocketConnected(false);
    setters.setPhaseDeadline(null);
    setters.setActiveAbilityPrompt(null);
    setters.setSelectedAbilityTargets([]);
    setters.pendingAbilityPromptAckRef.current = null;
  });
}

// Wires up player roster and per-player status/role events.
export function registerPlayerEvents(
  socket: Socket,
  roles: RoleSummary[],
  setters: {
    setPlayers: Dispatch<SetStateAction<Player[]>>;
    setPlayerStatus: Dispatch<SetStateAction<Map<string, PlayerStatus>>>;
    setCurrentPlayerRole: Dispatch<SetStateAction<{ id: string; name: string; image: string } | null>>;
  }
) {
  socket.on("playersChanged", (newPlayers) => {
    console.log("Received playersChanged:", newPlayers);
    setters.setPlayers(newPlayers);
  });

  socket.on("playerStatusUpdate", (statusArray: [string, PlayerStatus][]) => {
    console.log("Received playerStatusUpdate:", statusArray);
    setters.setPlayerStatus(new Map(statusArray));
  });

  socket.on("shareRole", (role) => {
    console.log("Received role:", role);
    if (typeof role === "string") {
      const fallbackRole = roles.find((item) => item.name.toLowerCase() === role.toLowerCase());
      setters.setCurrentPlayerRole(
        fallbackRole
          ? { id: role, name: fallbackRole.name, image: "" }
          : { id: role, name: role, image: "" }
      );
      return;
    }

    setters.setCurrentPlayerRole(role);
  });
}

// Wires up phase transitions, countdown timers, game start/end and voting events.
export function registerPhaseEvents(
  socket: Socket,
  setters: {
    setCurrentPhase: Dispatch<SetStateAction<Round["status"]>>;
    setLynchVotes: Dispatch<SetStateAction<Round["votes"]>>;
    setPhaseDeadline: Dispatch<SetStateAction<number | null>>;
    setGameStarted: Dispatch<SetStateAction<boolean>>;
    setWinner: Dispatch<SetStateAction<Round["teamWinner"]>>;
    setDiscussionSkipStatus: Dispatch<SetStateAction<VoteStatus | null>>;
    setPlayAgainStatus: Dispatch<SetStateAction<VoteStatus | null>>;
    setKnownWerewolfIds: Dispatch<SetStateAction<Player["id"][]>>;
    setRevealedCenterRoles: Dispatch<SetStateAction<Role[] | null>>;
  }
) {
  socket.on("phaseChange", (phase) => {
    setters.setCurrentPhase(phase);
    if (phase !== "Voting") {
      setters.setLynchVotes(new Map());
    }
    if (phase === "End") {
      setters.setPhaseDeadline(null);
    }
    if (phase !== "Discussion") {
      setters.setDiscussionSkipStatus(null);
    }
    if (phase !== "End") {
      setters.setPlayAgainStatus(null);
    }
    if (phase === "PreGame") {
      setters.setKnownWerewolfIds([]);
      setters.setRevealedCenterRoles(null);
    }
  });

  socket.on("gameStarted", () => {
    setters.setGameStarted(true);
    setters.setWinner(null);
  });

  socket.on("winner", (newWinner) => {
    setters.setWinner(newWinner);
  });

  socket.on("returnToLobby", () => {
    setters.setGameStarted(false);
    setters.setCurrentPhase(null);
    setters.setWinner(null);
    setters.setPlayAgainStatus(null);
  });

  socket.on("lynchVotesChange", (newLynchVotes: [string, string][]) => {
    setters.setLynchVotes(new Map(newLynchVotes));
  });

  socket.on("discussionSkipUpdate", (status: VoteStatus) => {
    setters.setDiscussionSkipStatus(status);
  });

  socket.on("playAgainVoteUpdate", (status: VoteStatus) => {
    setters.setPlayAgainStatus(status);
  });

  socket.on("centerRolesReveal", (roles: Role[]) => {
    setters.setRevealedCenterRoles(roles);
  });

  const durationEvents = ["startPreGame", "startNight", "startDiscussion", "startVoting"] as const;
  durationEvents.forEach((eventName) => {
    socket.on(eventName, (duration: number) => {
      console.log(`${eventName} received, duration:`, duration);
      startPhaseCountdown(setters.setPhaseDeadline, duration);
    });
  });
}

// Wires up ability prompt requests and their eventual results.
export function registerAbilityEvents(
  socket: Socket,
  setters: {
    setActiveAbilityPrompt: Dispatch<SetStateAction<AbilityPrompt | null>>;
    setSelectedAbilityTargets: Dispatch<SetStateAction<Player["id"][]>>;
    setLatestAbilityResult: Dispatch<SetStateAction<AbilityResult | null>>;
    setKnownWerewolfIds: Dispatch<SetStateAction<Player["id"][]>>;
    pendingAbilityPromptAckRef: PendingAbilityAckRef;
  }
) {
  socket.on("abilityPrompt", (prompt: AbilityPrompt, callback: (response: AbilityPromptResponse) => void) => {
    console.log("Received ability prompt:", prompt);
    setters.setLatestAbilityResult(null);

    if (prompt.requiredSelections <= 0) {
      callback({ selectedPlayerIds: [] });
      return;
    }

    setters.pendingAbilityPromptAckRef.current = callback;
    setters.setSelectedAbilityTargets([]);
    setters.setActiveAbilityPrompt(prompt);
  });

  socket.on("abilityResult", (result: AbilityResult) => {
    console.log("Received ability result:", result);
    setters.setActiveAbilityPrompt(null);
    setters.setSelectedAbilityTargets([]);
    setters.pendingAbilityPromptAckRef.current = null;
    setters.setLatestAbilityResult(result);

    if (result.revealedPlayerIds && WEREWOLF_REVEAL_ABILITY_IDS.includes(result.abilityId)) {
      setters.setKnownWerewolfIds(result.revealedPlayerIds);
    }
  });
}

// Wires up lobby-management events not tied to an in-progress round (role selection, kicks).
export function registerLobbyManagementEvents(
  socket: Socket,
  setters: {
    setSelectedRoleIds: Dispatch<SetStateAction<Role["id"][]>>;
    onKicked: () => void;
  }
) {
  socket.on("selectedRolesChanged", (roleIds: Role["id"][]) => {
    setters.setSelectedRoleIds(roleIds);
  });

  socket.on("kicked", () => {
    setters.onKicked();
  });
}
