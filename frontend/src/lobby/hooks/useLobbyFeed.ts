import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { Socket } from "socket.io-client";
import { getPhaseAnnouncement } from "../helpers/getPhaseDisplay";
import { Player, Round } from "../../Interfaces";
import { UiAlert } from "./useLobbyAlerts";

type LobbyFeedMessage = {
  id: string;
  kind: "player" | "system";
  playerName: string;
  message: string;
  timestamp: number;
};

function createSystemMessage(message: string): LobbyFeedMessage {
  return {
    id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: "system",
    playerName: "Lobby",
    message,
    timestamp: Date.now(),
  };
}

// Manages the lobby chat feed: incoming player messages, system announcements and the composer input.
export default function useLobbyFeed(
  socketRef: MutableRefObject<Socket | null>,
  currentPlayerId: Player["id"] | null,
  currentPhase: Round["status"],
  gameStarted: boolean,
  uiAlert: UiAlert | null
) {
  const [chatMessages, setChatMessages] = useState<LobbyFeedMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const lastPostedAlertRef = useRef<string | null>(null);

  const appendSystemMessage = (message: string) => {
    setChatMessages((prev) => [...prev, createSystemMessage(message)]);
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessageReceived = (data: { playerName: string; message: string; timestamp: number }) => {
      const messageId = `${data.playerName}-${data.timestamp}`;
      setChatMessages((prev) => [...prev, { id: messageId, kind: "player", ...data }]);
    };

    socket.on("messageReceived", handleMessageReceived);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
    };
  }, [socketRef]);

  useEffect(() => {
    if (!currentPhase) {
      return;
    }

    const announcement = getPhaseAnnouncement(currentPhase);
    if (announcement) {
      appendSystemMessage(announcement);
    }
  }, [currentPhase]);

  useEffect(() => {
    if (gameStarted) {
      appendSystemMessage("The game is starting. Good luck!");
    }
  }, [gameStarted]);

  useEffect(() => {
    if (!uiAlert) {
      return;
    }

    const alertText = uiAlert.message ? `${uiAlert.title}: ${uiAlert.message}` : uiAlert.title;
    if (lastPostedAlertRef.current === alertText) {
      return;
    }

    lastPostedAlertRef.current = alertText;
    appendSystemMessage(alertText);
  }, [uiAlert]);

  const handleSendMessage = () => {
    if (chatInput.trim() && currentPlayerId && currentPhase !== "Night") {
      socketRef.current.emit("sendMessage", currentPlayerId, chatInput.trim());
      setChatInput("");
    }
  };

  return { chatMessages, chatInput, setChatInput, handleSendMessage };
}
