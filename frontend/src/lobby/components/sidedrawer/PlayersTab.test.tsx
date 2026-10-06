import { fireEvent, render, screen } from "@testing-library/react";
import { Player } from "../../../Interfaces";
import PlayersTab from "./PlayersTab";

const players: Player[] = [
  { id: "host", name: "Host" },
  { id: "human", name: "Human" },
  { id: "bot", name: "Bot", isBot: true },
];

function renderPlayersTab(gameStarted: boolean) {
  const onKickPlayer = jest.fn();
  const onRemoveBot = jest.fn();

  render(
    <PlayersTab
      players={players}
      currentPlayerId="host"
      isHost
      gameStarted={gameStarted}
      playerStatus={new Map()}
      isPlayerMuted={() => false}
      onToggleMute={jest.fn()}
      getPlayerVolume={() => 1}
      onVolumeChange={jest.fn()}
      onRemoveBot={onRemoveBot}
      onKickPlayer={onKickPlayer}
    />,
  );

  return { onKickPlayer, onRemoveBot };
}

describe("PlayersTab host removal actions", () => {
  it("passes player IDs when kicking a player or removing a bot before the game", () => {
    const { onKickPlayer, onRemoveBot } = renderPlayersTab(false);

    fireEvent.click(screen.getByRole("button", { name: "Kick Human" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Bot" }));

    expect(onKickPlayer).toHaveBeenCalledWith("human");
    expect(onRemoveBot).toHaveBeenCalledWith("bot");
  });

  it("hides removal actions after the game has started", () => {
    renderPlayersTab(true);

    expect(screen.queryByRole("button", { name: "Kick Human" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove Bot" })).not.toBeInTheDocument();
  });
});
