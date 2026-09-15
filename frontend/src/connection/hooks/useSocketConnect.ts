import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation, useParams } from "wouter";
import { getRoles } from "../../lobby/helpers/getRolesFromTeam";
import {
  AbilityPrompt,
  AbilityPromptResponse,
  AbilityResult,
  Player,
  Role,
  Round,
  VoteStatus,
} from "../../Interfaces";
import { SERVER_URL, buildServerUrl } from "../../app/config/server";
import {
  registerAbilityEvents,
  registerConnectionEvents,
  registerLobbyManagementEvents,
  registerPhaseEvents,
  registerPlayerEvents,
} from "./socketEventHandlers";

export default function useSocketConnect() {
  const socketRef = useRef(null);
  const params = useParams<{ id?: string }>();
  const lobbyId = params.id;
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [roles] = useState(() => getRoles());
  const [currentPhase, setCurrentPhase] = useState<Round["status"]>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<Round["teamWinner"]>(null);
  const [discussionSkipStatus, setDiscussionSkipStatus] =
    useState<VoteStatus | null>(null);
  const [playAgainStatus, setPlayAgainStatus] = useState<VoteStatus | null>(
    null,
  );
  const [knownWerewolfIds, setKnownWerewolfIds] = useState<Player["id"][]>([]);
  const [revealedCenterRoles, setRevealedCenterRoles] = useState<Role[] | null>(
    null,
  );
  const [selectedRoleIds, setSelectedRoleIds] = useState<Role["id"][]>([]);
  const [lynchVotes, setLynchVotes] = useState<Round["votes"]>(new Map());
  const [playerStatus, setPlayerStatus] = useState<Round["playerStatus"]>(
    new Map(),
  );
  const [currentPlayer, setCurrentPlayer] = useState({
    id: null,
    name: null,
    isHost: false,
  });
  const [currentPlayerRole, setCurrentPlayerRole] = useState<{
    id: string;
    name: string;
    image: string;
  } | null>(null);
  const [phaseDeadline, setPhaseDeadline] = useState<number | null>(null);
  const [phaseCountdown, setPhaseCountdown] = useState<number | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeAbilityPrompt, setActiveAbilityPrompt] =
    useState<AbilityPrompt | null>(null);
  const [selectedAbilityTargets, setSelectedAbilityTargets] = useState<
    Player["id"][]
  >([]);
  const [latestAbilityResult, setLatestAbilityResult] =
    useState<AbilityResult | null>(null);
  const pendingAbilityPromptAckRef = useRef<
    ((response: AbilityPromptResponse) => void) | null
  >(null);

  const joinLobby = (playerName: string) => {
    const trimmedPlayerName = playerName.trim();
    if (
      !trimmedPlayerName ||
      !socketRef.current ||
      !socketConnected ||
      !lobbyId
    ) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      socketRef.current.timeout(10000).emit(
        "lobbyjoin",
        lobbyId,
        trimmedPlayerName,
        async (
          err: Error | null,
          res: {
            isValidId: boolean;
            player?: { id: string; name: string; isHost: boolean };
          },
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

          // Retry a few times before concluding the lobby is really gone - the very first
          // request after a cold backend start can transiently fail to find it.
          if (res?.isValidId === false) {
            let lobbyExists = false;
            for (let attempt = 0; attempt < 3 && !lobbyExists; attempt++) {
              lobbyExists = await fetch(buildServerUrl(`/lobbies/${lobbyId}`))
                .then(async (result) => {
                  const text = await result.text();
                  return text === "true";
                })
                .catch(() => false);

              if (!lobbyExists && attempt < 2) {
                await new Promise((resolve) => setTimeout(resolve, 1500));
              }
            }

            if (!lobbyExists) {
              setLocation("/?invalidId=true", { replace: true });
            }

            resolve(false);
            return;
          }

          resolve(false);
        },
      );
    });
  };

  const submitAbilityTarget = (playerId: Player["id"]) => {
    if (
      !activeAbilityPrompt ||
      !activeAbilityPrompt.validTargetIds.includes(playerId)
    ) {
      return;
    }

    setSelectedAbilityTargets((currentSelectedTargets) => {
      if (currentSelectedTargets.includes(playerId)) {
        return currentSelectedTargets;
      }

      const updatedTargets = [...currentSelectedTargets, playerId];

      if (updatedTargets.length >= activeAbilityPrompt.requiredSelections) {
        pendingAbilityPromptAckRef.current?.({
          selectedPlayerIds: updatedTargets,
        });
        pendingAbilityPromptAckRef.current = null;
        setActiveAbilityPrompt(null);
        return [];
      }

      return updatedTargets;
    });
  };

  // Stable identity so effects depending on this callback don't re-fire on every unrelated render.
  const dismissAbilityResult = useCallback(() => {
    setLatestAbilityResult(null);
  }, []);

  const submitPlayAgainVote = useCallback(() => {
    socketRef.current?.emit("playAgainVote");
  }, []);

  const addBot = useCallback(() => {
    socketRef.current?.emit("addBot", currentPlayer.id);
  }, [currentPlayer.id]);

  const removeBot = useCallback(
    (botPlayerId: Player["id"]) => {
      socketRef.current?.emit("removeBot", currentPlayer.id, botPlayerId);
    },
    [currentPlayer.id],
  );

  const kickPlayer = useCallback(
    (targetPlayerId: Player["id"]) => {
      socketRef.current?.emit("kickPlayer", currentPlayer.id, targetPlayerId);
    },
    [currentPlayer.id],
  );

  const updateSelectedRoles = useCallback(
    (roleIds: Role["id"][]) => {
      socketRef.current?.emit("updateSelectedRoles", currentPlayer.id, roleIds);
    },
    [currentPlayer.id],
  );

  useEffect(() => {
    if (phaseDeadline === null) {
      setPhaseCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((phaseDeadline - Date.now()) / 1000),
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
      transports: ["websocket", "polling"],
      timeout: 5000,
      forceNew: true,
    });
    socketRef.current = socket;

    registerConnectionEvents(socket, SERVER_URL, {
      setSocketConnected,
      setPhaseDeadline,
      setActiveAbilityPrompt,
      setSelectedAbilityTargets,
      pendingAbilityPromptAckRef,
    });

    registerPlayerEvents(socket, roles, {
      setPlayers,
      setPlayerStatus,
      setCurrentPlayerRole,
    });

    registerPhaseEvents(socket, {
      setCurrentPhase,
      setLynchVotes,
      setPhaseDeadline,
      setGameStarted,
      setWinner,
      setDiscussionSkipStatus,
      setPlayAgainStatus,
      setKnownWerewolfIds,
      setRevealedCenterRoles,
    });

    registerAbilityEvents(socket, {
      setActiveAbilityPrompt,
      setSelectedAbilityTargets,
      setLatestAbilityResult,
      setKnownWerewolfIds,
      pendingAbilityPromptAckRef,
    });

    registerLobbyManagementEvents(socket, {
      setSelectedRoleIds,
      onKicked: () => setLocation("/?kicked=true", { replace: true }),
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
    discussionSkipStatus,
    playAgainStatus,
    submitPlayAgainVote,
    addBot,
    removeBot,
    knownWerewolfIds,
    revealedCenterRoles,
    selectedRoleIds,
    updateSelectedRoles,
    kickPlayer,
  ] as const;
}
