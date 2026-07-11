import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation, useParams } from "wouter";
import { getRoles } from "../functions/getRolesFromTeam";
import { AbilityPrompt, AbilityPromptResponse, AbilityResult, Player, Round } from "../Interfaces";
import { SERVER_URL } from "../config/server";

export default function useSocketConnect() {
  const socketRef = useRef(null);
  const lobbyId = useRef(useParams()["id"]);
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [roles] = useState(() => getRoles());
  const [currentPhase, setCurrentPhase] = useState<Round["status"]>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<Round["teamWinner"]>(null);
  const [lynchVotes, setLynchVotes] = useState<Round["votes"]>(new Map());
  const [playerStatus, setPlayerStatus] = useState<Round["playerStatus"]>(
    new Map()
  );
  const [currentPlayer, setCurrentPlayer] = useState({
    id: null,
    name: null,
    isHost: false,
  });
  const [currentPlayerRole, setCurrentPlayerRole] = useState<{ id: string; name: string; image: string } | null>(null);
  const [phaseDeadline, setPhaseDeadline] = useState<number | null>(null);
  const [phaseCountdown, setPhaseCountdown] = useState<number | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeAbilityPrompt, setActiveAbilityPrompt] = useState<AbilityPrompt | null>(null);
  const [selectedAbilityTargets, setSelectedAbilityTargets] = useState<Player["id"][]>([]);
  const [latestAbilityResult, setLatestAbilityResult] = useState<AbilityResult | null>(null);
  const pendingAbilityPromptAckRef = useRef<((response: AbilityPromptResponse) => void) | null>(null);

  const joinLobby = (playerName: string) => {
    const trimmedPlayerName = playerName.trim();
    if (!trimmedPlayerName || !socketRef.current || !socketConnected) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      socketRef.current.timeout(10000).emit(
        "lobbyjoin",
        lobbyId.current,
        trimmedPlayerName,
        (
          err: Error | null,
          res: {
            isValidId: boolean;
            player?: { id: string; name: string; isHost: boolean };
          }
        ) => {
          if (err) {
            console.error("Timed out while joining lobby:", err.message);
            resolve(false);
            return;
          }

          if (res?.isValidId) {
            setCurrentPlayer(res.player);
            resolve(true);
            return;
          }

          // Only treat explicit invalid-id responses as invalid lobby kicks.
          if (res?.isValidId === false) {
            setLocation("/?invalidId=true", { replace: true });
            resolve(false);
            return;
          }

          resolve(false);
        }
      );
    });
  };

  const submitAbilityTarget = (playerId: Player["id"]) => {
    if (!activeAbilityPrompt || !activeAbilityPrompt.validTargetIds.includes(playerId)) {
      return;
    }

    setSelectedAbilityTargets((currentSelectedTargets) => {
      if (currentSelectedTargets.includes(playerId)) {
        return currentSelectedTargets;
      }

      const updatedTargets = [...currentSelectedTargets, playerId];

      if (updatedTargets.length >= activeAbilityPrompt.requiredSelections) {
        pendingAbilityPromptAckRef.current?.({ selectedPlayerIds: updatedTargets });
        pendingAbilityPromptAckRef.current = null;
        setActiveAbilityPrompt(null);
        return [];
      }

      return updatedTargets;
    });
  };

  const dismissAbilityResult = () => {
    setLatestAbilityResult(null);
  };

  useEffect(() => {
    if (phaseDeadline === null) {
      setPhaseCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((phaseDeadline - Date.now()) / 1000)
      );
      setPhaseCountdown(remainingSeconds);
      if (remainingSeconds === 0) {
        setPhaseDeadline(null);
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [phaseDeadline]);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    });
    socketRef.current = socket;

    socket.on("connect_error", (error) => {
      console.error("Socket connect error:", error);
      console.error("Socket URL:", SERVER_URL);
      console.error("Error message:", error.message);
      setSocketConnected(false);
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully to:", SERVER_URL);
      setSocketConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
      setPhaseDeadline(null);
      setActiveAbilityPrompt(null);
      setSelectedAbilityTargets([]);
      pendingAbilityPromptAckRef.current = null;
    });

    socket.on("playersChanged", (newPlayers) => {
      console.log("Received playersChanged:", newPlayers);
      setPlayers(newPlayers);
    });

    socket.on("phaseChange", (phase) => {
      setCurrentPhase(phase);
      if (phase === "End") {
        setPhaseDeadline(null);
      }
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
      setWinner(null);
    });

    socket.on("winner", (newWinner) => {
      setWinner(newWinner);
    });

    socket.on("abilityPrompt", (prompt: AbilityPrompt, callback: (response: AbilityPromptResponse) => void) => {
      console.log("Received ability prompt:", prompt);
      setLatestAbilityResult(null);

      if (prompt.requiredSelections <= 0) {
        callback({ selectedPlayerIds: [] });
        return;
      }

      pendingAbilityPromptAckRef.current = callback;
      setSelectedAbilityTargets([]);
      setActiveAbilityPrompt(prompt);
    });

    socket.on("abilityResult", (result: AbilityResult) => {
      console.log("Received ability result:", result);
      setActiveAbilityPrompt(null);
      setSelectedAbilityTargets([]);
      pendingAbilityPromptAckRef.current = null;
      setLatestAbilityResult(result);
    });

    socket.on("shareRole", (role) => {
      console.log("Received role:", role);
      if (typeof role === "string") {
        const fallbackRole = roles.find((item) => item.name.toLowerCase() === role.toLowerCase());
        setCurrentPlayerRole(
          fallbackRole
            ? { id: role, name: fallbackRole.name, image: "" }
            : { id: role, name: role, image: "" }
        );
        return;
      }

      setCurrentPlayerRole(role);
    });

    socket.on("playerStatusUpdate", (statusArray: [string, "Alive" | "Dead"][]) => {
      console.log("Received playerStatusUpdate:", statusArray);
      const statusMap = new Map<string, "Alive" | "Dead">(statusArray);
      setPlayerStatus(statusMap);
    });

    const startPhaseCountdown = (duration: number) => {
      if (!Number.isFinite(duration) || duration <= 0) {
        setPhaseDeadline(null);
        return;
      }

      setPhaseDeadline(Date.now() + duration * 1000);
    };

    socket.on("startPreGame", (duration) => {
      console.log("PreGame started, duration:", duration);
      startPhaseCountdown(duration);
    });

    socket.on("startNight", (duration) => {
      console.log("Night started, duration:", duration);
      startPhaseCountdown(duration);
    });

    socket.on("startDiscussion", (duration) => {
      console.log("Discussion started, duration:", duration);
      startPhaseCountdown(duration);
    });

    socket.on("startVoting", (duration) => {
      console.log("Voting started, duration:", duration);
      startPhaseCountdown(duration);
    });

    socket.on("lynchVotesChange", (newLynchVotes) => {
      // Convert array of [targetId, voterId] to Map
      const votesMap = new Map();
      newLynchVotes.forEach(([targetId, voterId]: [string, string]) => {
        // For now, just store the target ID - we can enhance this later
        votesMap.set(targetId, voterId);
      });
      setLynchVotes(votesMap);
    });

    return () => {
      pendingAbilityPromptAckRef.current = null;
      socket.disconnect();
    };
  }, [roles, setLocation]);

  return [
    players,
    roles,
    currentPlayer,
    currentPhase,
    playerStatus,
    gameStarted,
    winner,
    lynchVotes,
    socketRef,
    joinLobby,
    socketConnected,
    currentPlayerRole,
    phaseCountdown,
    activeAbilityPrompt,
    selectedAbilityTargets,
    latestAbilityResult,
    submitAbilityTarget,
    dismissAbilityResult,
  ] as const;
}
