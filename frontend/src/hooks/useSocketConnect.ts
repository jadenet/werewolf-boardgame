import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation, useParams } from "wouter";
import { getRoles } from "../functions/getRolesFromTeam";
import { Player, Round } from "@/Interfaces";

export default function useSocketConnect() {
  const socketRef = useRef(null);
  const lobbyId = useRef(useParams()["id"]);
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [roles, setRoles] = useState<{ name: string; img: string }[]>(getRoles());
  const [currentPhase, setCurrentPhase] = useState<Round["status"]>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<Round["teamWinner"]>(null);
  const [lynchVotes, setLynchVotes] = useState<Round["votes"]>(new Map());
  const [cards, setCards] = useState<Round["cards"]>([]);
  const [playerStatus, setPlayerStatus] = useState<Round["playerStatus"]>(
    new Map()
  );
  const [currentPlayer, setCurrentPlayer] = useState({
    id: null,
    name: null,
    isHost: false,
  });
  const [socketConnected, setSocketConnected] = useState(false);

  const joinLobby = (playerName: string) => {
    console.log("joinLobby called with:", playerName, "socketConnected:", socketConnected);
    if (socketConnected && playerName.trim()) {
      socketRef.current.timeout(5000).emit(
        "lobbyjoin",
        lobbyId.current,
        playerName.trim(),
        (
          _: never,
          res: {
            isValidId: boolean;
            player?: { id: string; name: string; isHost: boolean };
          }
        ) => {
          console.log("joinLobby callback received:", res);
          if (res && res.isValidId) {
            setCurrentPlayer(res.player);
          } else {
            setLocation("/?invalidId=true", { replace: true });
          }
        }
      );
    } else if (!socketConnected) {
      console.error("Socket not connected, cannot join lobby");
    }
  };

  useEffect(() => {
    const socketUrl = import.meta.env.PROD
      ? "https://werewolf-backend.onrender.com"
      : "http://localhost:10000";
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    });
    socketRef.current = socket;

    socket.on("connect_error", (error) => {
      console.error("Socket connect error:", error);
      console.error("Socket URL:", socketUrl);
      console.error("Error message:", error.message);
      setLocation("/?connectionError=true", { replace: true });
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully to:", socketUrl);
      setSocketConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
    });

    socket.on("playersChanged", (newPlayers) => {
      console.log("Received playersChanged:", newPlayers);
      setPlayers(newPlayers);
    });

    socket.on("rolesChanged", (newRoles) => {
      setRoles(newRoles);
    });

    socket.on("phaseChange", (phase) => {
      setCurrentPhase(phase);
    });

    socket.on("cardsChange", (newCards) => {
      setCards(newCards);
    });

    socket.on("playerStatusChange", (newPlayerStatus) => {
      setPlayerStatus(newPlayerStatus);
    });

    socket.on("gameStarted", () => {
      setGameStarted(!gameStarted);
    });

    socket.on("winner", (newWinner) => {
      setWinner(newWinner);
    });

    socket.on("shareRole", (role) => {
      console.log("Received role:", role);
      // Store the role for the current player
      // You might want to add a state for currentPlayerRole
    });

    socket.on("startNight", (duration) => {
      console.log("Night started, duration:", duration);
    });

    socket.on("startDiscussion", (duration) => {
      console.log("Discussion started, duration:", duration);
    });

    socket.on("startVoting", (duration) => {
      console.log("Voting started, duration:", duration);
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
      socket.disconnect();
    };
  }, [setLocation]);

  return [
    players,
    roles,
    currentPlayer,
    currentPhase,
    cards,
    playerStatus,
    gameStarted,
    winner,
    lynchVotes,
    socketRef,
    joinLobby,
    socketConnected,
  ] as const;
}
