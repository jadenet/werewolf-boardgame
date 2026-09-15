import { useState } from "react";
import useThemePreference from "../shared/useThemePreference.ts";
import NameModal from "../lobby/components/modals/NameModal.tsx";
import PlayerCard from "../lobby/components/PlayerCard.tsx";
import AddPlayerCard from "../lobby/components/AddPlayerCard.tsx";
import CenterCards from "../lobby/components/CenterCards.tsx";
import AbilityPromptBanner from "../lobby/components/AbilityPromptBanner.tsx";
import GameOverModal from "../lobby/components/modals/GameOverModal.tsx";
import LobbyStatusBar from "../lobby/components/LobbyStatusBar.tsx";
import usePeerConnect from "../connection/hooks/usePeerConnect.ts";
import useSocketConnect from "../connection/hooks/useSocketConnect.ts";
import useLobbyAlerts from "../lobby/hooks/useLobbyAlerts.ts";
import useLobbyFeed from "../lobby/hooks/useLobbyFeed.ts";
import usePlayerMuting from "../connection/hooks/usePlayerMuting.ts";
import useBrowserTabPhaseIcon from "../lobby/hooks/useBrowserTabPhaseIcon.ts";
import useRoleCatalog from "../lobby/hooks/useRoleCatalog.ts";
import SideDrawer from "../lobby/components/sidedrawer/SideDrawer.tsx";

const MINIMUM_PLAYER_COUNT = 3;

export default function Lobbiesid() {
  const [openedDrawer, setOpenedDrawer] = useState(true);
  const [talkingPlayerIds, setTalkingPlayerIds] = useState<
    Record<string, boolean>
  >({});
  const [themePreference, setThemePreference] = useThemePreference();

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
    discussionSkipStatus,
    playAgainStatus,
    submitPlayAgainVote,
    addBot,
    removeBot,
    knownWerewolfIds,
    revealedCenterRoles,
    selectedRoleIds,
    kickPlayer,
  ] = useSocketConnect();

  const roleCatalog = useRoleCatalog();

  const { isMicMuted, toggleMicMute } = usePeerConnect(
    currentPlayer,
    players,
    (playerId, isTalking) => {
      setTalkingPlayerIds((previous) => {
        if (previous[playerId] === isTalking) {
          return previous;
        }

        return {
          ...previous,
          [playerId]: isTalking,
        };
      });
    },
  );

  const [uiAlert, setUiAlert] = useLobbyAlerts(
    currentPlayer.id,
    socketConnected,
    winner,
    latestAbilityResult,
    dismissAbilityResult,
  );

  const { chatMessages, chatInput, setChatInput, handleSendMessage } =
    useLobbyFeed(
      socketRef,
      currentPlayer.id,
      currentPhase,
      gameStarted,
      uiAlert,
    );

  const {
    isPlayerMuted,
    handleTogglePlayerMute,
    getPlayerVolume,
    handleVolumeChange,
  } = usePlayerMuting(players, currentPlayer.id, isMicMuted, toggleMicMute);

  const formattedPhaseCountdown = () => {
    if (phaseCountdown === null) {
      return null;
    }

    const minutes = Math.floor(phaseCountdown / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (phaseCountdown % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useBrowserTabPhaseIcon(currentPhase);

  const handleStartGame = async () => {
    try {
      socketRef.current.emit(
        "gameStart",
        currentPlayer.id,
        (response: { success?: boolean; error?: string }) => {
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
        },
      );
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

  return (
    <>
      {!currentPlayer.id && (
        <NameModal
          socket={socketRef}
          onNameEnter={joinLobby}
          socketConnected={socketConnected}
        />
      )}
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

          {currentPhase === "End" && (
            <GameOverModal
              winner={winner}
              playAgainStatus={playAgainStatus}
              onPlayAgainVote={submitPlayAgainVote}
              revealedCenterRoles={revealedCenterRoles}
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
              {players.slice(0, Math.ceil(players.length / 2)).map((player) => (
                <PlayerCard
                  player={player}
                  key={player.id}
                  currentPlayer={currentPlayer}
                  currentPhase={currentPhase}
                  socket={socketRef}
                  lynchVotes={lynchVotes}
                  players={players}
                  isTalking={Boolean(talkingPlayerIds[player.id])}
                  isMuted={isPlayerMuted(player.id)}
                  onToggleMute={handleTogglePlayerMute}
                  isKnownWerewolf={knownWerewolfIds.includes(player.id)}
                  abilityTargetSelectable={activeAbilityPrompt?.validTargetIds.includes(
                    player.id,
                  )}
                  abilityTargetSelected={selectedAbilityTargets.includes(
                    player.id,
                  )}
                  onAbilityTargetSelect={
                    activeAbilityPrompt?.validTargetIds.includes(player.id)
                      ? submitAbilityTarget
                      : undefined
                  }
                />
              ))}
            </div>

            <CenterCards
              validTargetIds={activeAbilityPrompt?.validTargetIds}
              selectedTargetIds={selectedAbilityTargets}
              onSelect={submitAbilityTarget}
              revealedRoles={revealedCenterRoles}
            />

            <div className="flex flex-wrap items-center justify-center gap-6 p-8 mx-8">
              {players.slice(Math.ceil(players.length / 2)).map((player) => (
                <PlayerCard
                  player={player}
                  key={player.id}
                  currentPlayer={currentPlayer}
                  currentPhase={currentPhase}
                  socket={socketRef}
                  lynchVotes={lynchVotes}
                  players={players}
                  isTalking={Boolean(talkingPlayerIds[player.id])}
                  isMuted={isPlayerMuted(player.id)}
                  onToggleMute={handleTogglePlayerMute}
                  isKnownWerewolf={knownWerewolfIds.includes(player.id)}
                  abilityTargetSelectable={activeAbilityPrompt?.validTargetIds.includes(
                    player.id,
                  )}
                  abilityTargetSelected={selectedAbilityTargets.includes(
                    player.id,
                  )}
                  onAbilityTargetSelect={
                    activeAbilityPrompt?.validTargetIds.includes(player.id)
                      ? submitAbilityTarget
                      : undefined
                  }
                />
              ))}
              {currentPhase === null && players.length < 10 && (
                <AddPlayerCard
                  isHost={Boolean(currentPlayer.isHost)}
                  onAddBot={addBot}
                />
              )}
            </div>
          </div>

          <LobbyStatusBar
            playersCount={players.length}
            currentPhase={currentPhase}
            currentRoleName={currentPlayerRole?.name || null}
            activeAbilityName={activeAbilityPrompt?.abilityName || null}
            winner={winner}
            formattedPhaseCountdown={formattedPhaseCountdown()}
            canStartGame={
              currentPhase === null &&
              currentPlayer.isHost &&
              players.length >= MINIMUM_PLAYER_COUNT
            }
            onStartGame={handleStartGame}
            canSkipDiscussion={currentPhase === "Discussion"}
            onSkipDiscussion={handleSkipDiscussion}
            discussionSkipStatus={discussionSkipStatus}
          />
        </div>

        <SideDrawer
          roles={roles}
          roleCatalog={roleCatalog}
          selectedRoleIds={selectedRoleIds}
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
          isPlayerMuted={isPlayerMuted}
          onTogglePlayerMute={handleTogglePlayerMute}
          getPlayerVolume={getPlayerVolume}
          onPlayerVolumeChange={handleVolumeChange}
          onRemoveBot={removeBot}
          onKickPlayer={kickPlayer}
        />
      </div>
    </>
  );
}
