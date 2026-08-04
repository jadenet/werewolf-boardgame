import { useEffect, useState } from "react";
import useThemePreference from "../hooks/useThemePreference.ts";
import NameModal from "../components/NameModal.tsx";
import PlayerCard from "../components/PlayerCard.tsx";
import AbilityPromptBanner from "../components/AbilityPromptBanner.tsx";
import LobbyStatusBar from "../components/LobbyStatusBar.tsx";
import usePeerConnect from "../hooks/usePeerConnect.ts";
import useSocketConnect from "../hooks/useSocketConnect.ts";
import SideDrawer from "../components/SideDrawer.tsx";
import { getPhaseDisplay, setBrowserTabIcon } from "../functions/getPhaseDisplay";

type LobbyFeedMessage = {
  id: string;
  kind: "player" | "system";
  playerName: string;
  message: string;
  timestamp: number;
};

function getPhaseAnnouncement(currentPhase: "PreGame" | "Discussion" | "Voting" | "Night" | "End") {
  switch (currentPhase) {
    case "PreGame":
      return "The lobby is ready and waiting for players.";
    case "Discussion":
      return "Discussion phase has started. Chat is open.";
    case "Voting":
      return "Voting phase has started.";
    case "Night":
      return "Night has fallen. Chat is disabled until morning.";
    case "End":
      return "The game has ended.";
  }
}

export default function Lobbiesid() {
  const [openedDrawer, setOpenedDrawer] = useState(true);
  const [talkingPlayerIds, setTalkingPlayerIds] = useState<Record<string, boolean>>({});
  const [mutedPlayerIds, setMutedPlayerIds] = useState<Record<string, boolean>>({});
  const [themePreference, setThemePreference] = useThemePreference();
  const [uiAlert, setUiAlert] = useState<{
    tone: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<LobbyFeedMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [
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
  ] = useSocketConnect();

  const { isMicMuted, toggleMicMute } = usePeerConnect(currentPlayer, players, (playerId, isTalking) => {
    setTalkingPlayerIds((previous) => {
      if (previous[playerId] === isTalking) {
        return previous;
      }

      return {
        ...previous,
        [playerId]: isTalking,
      };
    });
  });

  const appendSystemMessage = (message: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind: "system",
        playerName: "Lobby",
        message,
        timestamp: Date.now(),
      },
    ]);
  };

  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessageReceived = (
      data: {
        playerName: string;
        message: string;
        timestamp: number;
      }
    ) => {
      const messageId = `${data.playerName}-${data.timestamp}`;
      setChatMessages((prev) => [
        ...prev,
        { id: messageId, kind: "player", ...data },
      ]);
    };

    socketRef.current.on("messageReceived", handleMessageReceived);

    return () => {
      socketRef.current?.off("messageReceived", handleMessageReceived);
    };
  }, []);

  useEffect(() => {
    if (!currentPhase) {
      return;
    }

    appendSystemMessage(getPhaseAnnouncement(currentPhase));
  }, [currentPhase]);

  useEffect(() => {
    const phaseInfo = getPhaseDisplay(currentPhase);
    setBrowserTabIcon(phaseInfo.icon);
    document.title = `Werewolf`;

    return () => {
      document.title = "Werewolf";
    };
  }, [currentPhase]);

  useEffect(() => {
    if (gameStarted) {
      appendSystemMessage("The game has started.");
    }
  }, [gameStarted]);

  useEffect(() => {
    if (!uiAlert) {
      return;
    }

    appendSystemMessage(uiAlert.message ? `${uiAlert.title}: ${uiAlert.message}` : uiAlert.title);
  }, [uiAlert]);

  const handleSendMessage = () => {
    if (chatInput.trim() && currentPlayer.id && currentPhase !== "Night") {
      socketRef.current.emit("sendMessage", currentPlayer.id, chatInput.trim());
      setChatInput("");
    }
  };

  const formattedPhaseCountdown = phaseCountdown === null
    ? null
    : `${Math.floor(phaseCountdown / 60)
        .toString()
        .padStart(2, "0")}:${(phaseCountdown % 60)
        .toString()
        .padStart(2, "0")}`;
  
  const alertToneClasses = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    error: "alert-error",
  } as const;

  const alertToneIcons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  } as const;

  const handleStartGame = async () => {
    try {
      socketRef.current.emit("gameStart", currentPlayer.id, (response: any) => {
        if (response && response.success) {
          console.log("Game started successfully");
          return;
        }

        console.error("Failed to start game:", response?.error);
        setUiAlert({
          tone: "error",
          title: "Failed to start game",
          message: response?.error || "Unknown error",
        });
      });
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setUiAlert({
        tone: "error",
        title: "Failed to start game",
        message: "Could not load roles",
      });
    }
  };

  const handleSkipDiscussion = () => {
    socketRef.current.emit("discussionSkip");
  };

  const handleTogglePlayerMute = (playerId: string) => {
    if (playerId === currentPlayer.id) {
      toggleMicMute();
      return;
    }

    setMutedPlayerIds((previous) => {
      const nextMuted = !Boolean(previous[playerId]);

      const audioElement = document.getElementById(`audio-${playerId}`) as HTMLAudioElement | null;
      if (audioElement) {
        audioElement.muted = nextMuted;
      }

      return {
        ...previous,
        [playerId]: nextMuted,
      };
    });
  };

  useEffect(() => {
    Object.entries(mutedPlayerIds).forEach(([playerId, isMuted]) => {
      const audioElement = document.getElementById(`audio-${playerId}`) as HTMLAudioElement | null;
      if (audioElement) {
        audioElement.muted = isMuted;
      }
    });
  }, [mutedPlayerIds, players]);

  useEffect(() => {
    if (!currentPlayer.id) {
      setUiAlert(null);
      return;
    }

    if (!socketConnected) {
      setUiAlert({
        tone: "warning",
        title: "Reconnecting to lobby",
        message: "Trying to restore your connection to the server.",
      });
      return;
    }

    if (winner && winner.length > 0) {
      setUiAlert({
        tone: "success",
        title: "Game over",
        message: `Winner${winner.length > 1 ? "s" : ""}: ${winner.join(", ")}`,
      });
      return;
    }

    setUiAlert((currentAlert) =>
      currentAlert?.tone === "error" ? currentAlert : null
    );
  }, [currentPlayer.id, socketConnected, winner]);

  useEffect(() => {
    if (!latestAbilityResult) {
      return;
    }

    setUiAlert({
      tone: latestAbilityResult.tone,
      title: latestAbilityResult.title,
      message: latestAbilityResult.message,
    });

    const timeoutId = window.setTimeout(() => {
      dismissAbilityResult();
      setUiAlert((currentAlert) => {
        if (
          currentAlert?.title === latestAbilityResult.title &&
          currentAlert?.message === latestAbilityResult.message
        ) {
          return null;
        }

        return currentAlert;
      });
    }, 6000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dismissAbilityResult, latestAbilityResult]);

  return (
    <>
      {uiAlert && (
        <div className="toast toast-top toast-center z-50 mt-16">
          <div className={`alert ${alertToneClasses[uiAlert.tone]} w-[min(92vw,32rem)]`}>
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-lg leading-none">{alertToneIcons[uiAlert.tone]}</span>
                <div>
                  <h3 className="font-bold">{uiAlert.title}</h3>
                  {uiAlert.message && <p className="text-sm">{uiAlert.message}</p>}
                </div>
              </div>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => setUiAlert(null)}
                aria-label="Dismiss alert"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      {!currentPlayer.id && <NameModal socket={socketRef} onNameEnter={joinLobby} socketConnected={socketConnected} />}
      <div
        className={`drawer h-[92vh] drawer-end ${
          openedDrawer && "drawer-open"
        }`}
      >
        <input
          id="my-drawer-2"
          type="checkbox"
          className="drawer-toggle"
          checked={openedDrawer}
          onChange={() => {
            setOpenedDrawer(!openedDrawer);
          }}
        />
        <div className="drawer-content flex flex-col h-full overflow-hidden">
          {activeAbilityPrompt && (
            <AbilityPromptBanner
              activeAbilityPrompt={activeAbilityPrompt}
              selectedAbilityTargets={selectedAbilityTargets}
            />
          )}

          <label
            htmlFor="my-drawer-2"
            className={`drawer-button btn btn-circle btn-primary ${
              openedDrawer && "btn-outline bg-base-200"
            } absolute ${
              openedDrawer ? "right-[23rem]" : "right-10"
            } top-[6rem] z-10`}
          >
            {openedDrawer ? "❌" : "📋"}
          </label>

          <div className="flex flex-1 min-h-0 flex-col items-center overflow-y-auto p-4">
            <div className="flex flex-wrap items-center justify-center gap-6 p-8 mx-8">
              {players.map((player) => (
                <PlayerCard
                  player={player}
                  key={player.id}
                  currentPlayer={currentPlayer}
                  currentPhase={currentPhase}
                  socket={socketRef}
                  lynchVotes={lynchVotes}
                  isTalking={Boolean(talkingPlayerIds[player.id])}
                  isMuted={player.id === currentPlayer.id ? isMicMuted : Boolean(mutedPlayerIds[player.id])}
                  onToggleMute={handleTogglePlayerMute}
                  abilityTargetSelectable={activeAbilityPrompt?.validTargetIds.includes(player.id)}
                  abilityTargetSelected={selectedAbilityTargets.includes(player.id)}
                  onAbilityTargetSelect={
                    activeAbilityPrompt?.validTargetIds.includes(player.id)
                      ? submitAbilityTarget
                      : undefined
                  }
                />
              ))}
            </div>
          </div>

          <LobbyStatusBar
            playersCount={players.length}
            currentPhase={currentPhase}
            currentRoleName={currentPlayerRole?.name || null}
            activeAbilityName={activeAbilityPrompt?.abilityName || null}
            winner={winner}
            formattedPhaseCountdown={formattedPhaseCountdown}
            canStartGame={currentPhase === null && currentPlayer.isHost && players.length >= 4}
            onStartGame={handleStartGame}
            canSkipDiscussion={currentPhase === "Discussion"}
            onSkipDiscussion={handleSkipDiscussion}
          />
        </div>

        <SideDrawer
          roles={roles}
          players={players}
          playerStatus={playerStatus}
          gameStarted={gameStarted}
          currentPhase={currentPhase}
          chatMessages={chatMessages}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendMessage={handleSendMessage}
          themePreference={themePreference}
          setThemePreference={setThemePreference}
          currentPlayer={currentPlayer}
        />
      </div>
    </>
  );
}
