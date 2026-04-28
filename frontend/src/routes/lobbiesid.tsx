import { useEffect, useState } from "react";
import useThemePreference from "../hooks/useThemePreference.ts";
import NameModal from "../components/NameModal.tsx";
import LeaveModal from "../components/LeaveModal.tsx";
import PlayerCard from "../components/PlayerCard.tsx";
import usePeerConnect from "../hooks/usePeerConnect.ts";
import useSocketConnect from "../hooks/useSocketConnect.ts";

export default function Lobbiesid() {
  const [openedDrawer, setOpenedDrawer] = useState(true);
  const [themePreference, setThemePreference] = useThemePreference();
  const [uiAlert, setUiAlert] = useState<{
    tone: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
  } | null>(null);

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
  ] = useSocketConnect();

  usePeerConnect(currentPlayer, players);

  const getPhaseDisplay = () => {
    switch (currentPhase) {
      case "PreGame":
        return { text: "Waiting for Players", icon: "⏳", color: "text-base-content" };
      case "Discussion":
        return { text: "Discussion Phase", icon: "💬", color: "text-primary" };
      case "Voting":
        return { text: "Voting Phase", icon: "🗳️", color: "text-secondary" };
      case "Night":
        return { text: "Night Phase", icon: "🌙", color: "text-accent" };
      default:
        return { text: currentPhase || "Loading...", icon: "🎭", color: "text-base-content" };
    }
  };

  const phaseInfo = getPhaseDisplay();
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
          {/* Phase status banner */}
          <div className="mx-4 mt-4 rounded-2xl border border-base-300 bg-base-100/90 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between w-full gap-4 p-4">
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${phaseInfo.color}`}>{phaseInfo.icon}</span>
                <div>
                  <h3 className={`font-bold text-lg ${phaseInfo.color}`}>{phaseInfo.text}</h3>
                  {winner && winner.length > 0 && (
                    <p className="text-sm">
                      Winner{winner.length > 1 ? 's' : ''}: <span className="font-semibold text-success">{winner.join(', ')}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {/* Start game button for host */}
                {currentPhase === null && currentPlayer.isHost && players.length >= 3 && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      // Get all available roles for now (should ideally get selected roles)
                      fetch((import.meta.env.PROD ? "https://werewolf-backend.onrender.com" : "http://localhost:10000") + "/roles")
                        .then(res => res.json())
                        .then(allRoles => {
                          socketRef.current.emit("gameStart", currentPlayer.id, allRoles, {}, (response: any) => {
                            if (response && response.success) {
                              console.log("Game started successfully");
                            } else {
                              console.error("Failed to start game:", response?.error);
                              setUiAlert({
                                tone: "error",
                                title: "Failed to start game",
                                message: response?.error || "Unknown error",
                              });
                            }
                          });
                        })
                        .catch(error => {
                          console.error("Failed to fetch roles:", error);
                          setUiAlert({
                            tone: "error",
                            title: "Failed to start game",
                            message: "Could not load roles",
                          });
                        });
                    }}
                  >
                    Start Game
                  </button>
                )}

                {/* Discussion skip button */}
                {currentPhase === "Discussion" && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      socketRef.current.emit("discussionSkip");
                    }}
                  >
                    Skip Discussion
                  </button>
                )}
              </div>
            </div>
          </div>

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
                  stream={new MediaStream()}
                />
              ))}
            </div>

            {/* Game status messages */}
            <div className="toast toast-center toast-middle">
              {/* Game event notifications would go here */}
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center justify-between gap-6 w-full h-20 p-4 bg-base-200/80 backdrop-blur-sm border-t border-base-300">
            <div className="flex items-center gap-4">
              <div className="stat">
                <div className="stat-title">Players</div>
                <div className="stat-value text-primary">{players.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Phase</div>
                <div className="stat-value text-secondary">{currentPhase || "None"}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-base-content/70">
                Abilities: None
              </div>
              {winner && (
                <div className="badge badge-success badge-lg">
                  🏆 {winner}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="drawer-side h-[92vh]">
          <div className="p-5 h-full min-w-96 max-w-96 bg-base-200/95 backdrop-blur-md">
            <div role="tablist" className="tabs tabs-lifted max-h-screen">
              <input
                type="radio"
                name="sidebar"
                aria-label="Roles"
                role="tab"
                className="tab"
                defaultChecked
              />

              <div role="tabpanel" className="tab-content">
                <div className="flex flex-col gap-6 mx-2 my-8">
                  <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
                    <h4 className="text-lg font-semibold mb-4 text-center">Available Roles</h4>
                    <div className="grid grid-cols-4 items-center gap-2">
                      {roles.map((role, i) => {
                        return (
                          <div key={i} className="tooltip tooltip-bottom" data-tip={role.name}>
                            <div className={`avatar ${["Seer", "Mason", "Tanner"].includes(role.name) && "opacity-50"}`}>
                              <div className="w-12 h-12 rounded-lg ring ring-base-300 ring-offset-1 ring-offset-base-100">
                                <img
                                  src={`/images/roles/${role.name}.png`}
                                  alt={role.name}
                                  className="object-contain p-1"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
                    <h4 className="text-lg font-semibold mb-4 text-center">Players</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {players.map((player, i) => {
                        const isAlive = playerStatus.get(player) === "Alive" || !gameStarted;
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                              isAlive
                                ? "bg-base-100/70"
                                : "bg-base-300/50 opacity-60"
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full ${
                              isAlive ? "bg-success" : "bg-error"
                            }`}></div>
                            <span className={`font-medium ${!isAlive && "line-through"}`}>
                              {player.name}
                              {!isAlive && " (Eliminated)"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <input
                type="radio"
                name="sidebar"
                aria-label="Settings"
                role="tab"
                className="tab"
              />

              <div role="tabpanel" className="tab-content">
                <div className="flex flex-col gap-6 mx-2 my-8">
                  <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
                    <h4 className="text-lg font-semibold mb-4 text-center">Game Settings</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Gamemode:</span>
                        <span className="badge badge-primary">Classic</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Chat:</span>
                        <span className="badge badge-secondary">Audio</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Players:</span>
                        <span className="badge badge-accent">{players.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
                    <h4 className="text-lg font-semibold mb-4 text-center">Theme</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        {
                          name: "Default",
                          value: !gameStarted
                            ? "default"
                            : currentPhase !== "Night"
                            ? "light"
                            : "dark",
                        },
                        { name: "Light", value: "light" },
                        { name: "Dark", value: "dark" },
                        { name: "Mystery", value: "mystery" },
                      ].map((option, i) => (
                        <input
                          type="radio"
                          name="theme-selector"
                          key={i}
                          value={option.value}
                          className="btn btn-outline btn-sm theme-controller w-full"
                          defaultChecked={themePreference === option.name}
                          onClick={() => setThemePreference(option.name)}
                          aria-label={option.name}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    className="btn btn-error btn-outline w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={() => {
                      const element = document.getElementById(
                        "my_modal_5"
                      ) as HTMLDialogElement;
                      element?.showModal();
                    }}
                  >
                    {currentPlayer && currentPlayer.isHost
                      ? "🏰 End Game"
                      : "🚪 Leave Game"}
                  </button>
                  <LeaveModal currentPlayer={currentPlayer} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
