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
  const [roles, setRoles] = useState(getRoles());
  const [currentPhase, setCurrentPhase] = useState<Round["status"]>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<Round["teamWinner"]>(null);
  const [lynchVotes, setLynchVotes] = useState<Round["votes"]>(new Map());
  const [cards, setCards] = useState<Round["cards"]>([]);
  const [playerStatus, setPlayerStatus] = useState<Round["playerStatus"]>(new Map());
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
            player?: { id: string; name: string; isHost: boolean };
          }
        ) => {
          if (res && res.isValidId) {
            setCurrentPlayer(res.player);
          } else {
            setLocation("/?invalidId=true", { replace: true });
            return;
          }
        }
      );
    });

    socket.on("playersChanged", (newPlayers) => {
      console.log("emitt")
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

    socket.on("lynchVotesChange", (newLynchVotes) => {
      setLynchVotes(newLynchVotes);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameStarted, setLocation]);

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
  ] as const;
}
