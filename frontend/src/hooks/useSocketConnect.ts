import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation, useParams } from "wouter";

export default function useSocketConnect() {
  const socketRef = useRef(null);
  const lobbyId = useRef(useParams()["id"]);
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [werewolvesVotes, setWerewolvesVotes] = useState([]);
  const [lynchVotes, setLynchVotes] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState({
    id: null,
    name: null,
    isHost: false,
  });

  useEffect(() => {
    const socketUrl = import.meta.env.PROD
      ? "https://werewolf-backend.onrender.com"
      : "http://localhost:10000";
    const socket = io(socketUrl, { port: 10000 });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.timeout(5000).emit(
        "lobbyjoin",
        lobbyId.current,
        "",
        (
          _: never,
          res: {
            isValidId: boolean;
            player: { id: string; name: string; isHost: boolean };
          }
        ) => {
          if (res.isValidId) {
            setCurrentPlayer(res.player);
          } else {
            setLocation("/lobbies?invalidId=true", { replace: true });
          }
        }
      );
    });

    socket.on("playersChanged", (newPlayers) => {
      setPlayers(newPlayers);
    });

    socket.on("phaseChange", (phase) => {
      setCurrentPhase(phase);
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
    });

    socket.on("winner", (newWinner) => {
      setWinner(newWinner);
    });

    socket.on("werewolvesVotesChange", (newWerewolvesVotes) => {
      setWerewolvesVotes(newWerewolvesVotes);
    });

    socket.on("lynchVotesChange", (newLynchVotes) => {
      setLynchVotes(newLynchVotes);
    });

    return () => {
      socket.disconnect();
    };
  }, [setLocation]);

  return [
    players,
    currentPlayer,
    currentPhase,
    gameStarted,
    winner,
    werewolvesVotes,
    lynchVotes,
    socketRef,
  ] as const;
}
