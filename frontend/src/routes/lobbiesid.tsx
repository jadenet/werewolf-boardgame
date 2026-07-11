import { useEffect, useState } from "react";
import useThemePreference from "../hooks/useThemePreference.ts";
import NameModal from "../components/NameModal.tsx";
import PlayerCard from "../components/PlayerCard.tsx";
import PhaseStatusBanner from "../components/PhaseStatusBanner.tsx";
import AbilityPromptBanner from "../components/AbilityPromptBanner.tsx";
import LobbyChatSection from "../components/LobbyChatSection.tsx";
import LobbyStatusBar from "../components/LobbyStatusBar.tsx";
import usePeerConnect from "../hooks/usePeerConnect.ts";
import useSocketConnect from "../hooks/useSocketConnect.ts";
import SideDrawer from "../components/SideDrawer.tsx";

export default function Lobbiesid() {
  const [openedDrawer, setOpenedDrawer] = useState(true);
  const [themePreference, setThemePreference] = useThemePreference();
  const [uiAlert, setUiAlert] = useState<{
    tone: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      playerId: string;
      playerName: string;
      message: string;
      timestamp: number;
    }>
  >([]);
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

  usePeerConnect(currentPlayer, players);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessageReceived = (
      data: {
        playerId: string;
        playerName: string;
        message: string;
        timestamp: number;
      }
    ) => {
      const messageId = `${data.playerId}-${data.timestamp}`;
      setChatMessages((prev) => [...prev, { id: messageId, ...data }]);

      // Auto-dismiss message after 4 seconds
      const timer = setTimeout(() => {
        setChatMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }, 4000);

      return () => clearTimeout(timer);
    };

    socketRef.current.on("messageReceived", handleMessageReceived);

    return () => {
      socketRef.current?.off("messageReceived", handleMessageReceived);
    };
  }, []);

  const handleSendMessage = () => {
    if (chatInput.trim() && currentPlayer.id && currentPhase === "Discussion") {
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
          <div className={`alert ${alertToneClasses[uiAlert.tone]} w-[min(92vw,32rem)] shadow-xl`}>
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
        <div className="drawer-content flex flex-col justify-between">
          {activeAbilityPrompt && (
            <AbilityPromptBanner
              activeAbilityPrompt={activeAbilityPrompt}
              selectedAbilityTargets={selectedAbilityTargets}
            />
          )}

          <label
            htmlFor="my-drawer-2"
            className={`drawer-button btn btn-circle btn-primary shadow-lg hover:shadow-xl transition-all duration-300 ${
              openedDrawer && "btn-outline bg-base-200"
            } absolute ${
              openedDrawer ? "right-[23rem]" : "right-10"
            } top-[6rem] z-10`}
          >
            {openedDrawer ? "❌" : "📋"}
          </label>

          <div className="flex flex-col items-center justify-center overflow-y-auto p-4">
            <div className="flex flex-wrap items-center justify-center gap-6 p-8 mx-8">
              {players.map((player) => (
                <PlayerCard
                  player={player}
                  key={player.id}
                  currentPlayer={currentPlayer}
                  currentPhase={currentPhase}
                  socket={socketRef}
                  lynchVotes={lynchVotes}
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

            {/* Game status messages */}
            <div className="toast toast-center toast-middle">
              {/* Game event notifications would go here */}
            </div>
          </div>

          <LobbyChatSection
            chatMessages={chatMessages}
            currentPhase={currentPhase}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendMessage={handleSendMessage}
          />

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
          themePreference={themePreference}
          setThemePreference={setThemePreference}
          currentPlayer={currentPlayer}
        />
      </div>
    </>
  );
}
