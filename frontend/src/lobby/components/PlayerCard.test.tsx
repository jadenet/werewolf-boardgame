import { render, screen } from "@testing-library/react";
import { Socket } from "socket.io-client";
import { Player, Role } from "../../Interfaces";
import PlayerCard from "./PlayerCard";

jest.mock("../helpers/getAvatarUrl.ts", () => jest.fn(() => "avatar.png"));

const player: Player = { id: "player-1", name: "Alex" };

function renderPlayerCard(isTalking: boolean) {
  return render(
    <PlayerCard
      player={player}
      key={player.id}
      currentPlayer={{ id: "current-player", name: "Current Player" }}
      currentPhase="Discussion"
      lynchVotes={new Map()}
      players={[player]}
      socket={{ current: { emit: jest.fn() } as unknown as Socket }}
      isTalking={isTalking}
    />,
  );
}

describe("PlayerCard", () => {
  it("shows the audio indicator while the player is talking", () => {
    renderPlayerCard(true);

    expect(screen.getByRole("status", { name: "Alex is speaking" })).toBeInTheDocument();
  });

  it("hides the audio indicator when the player is not talking", () => {
    renderPlayerCard(false);

    expect(screen.queryByRole("status", { name: "Alex is speaking" })).not.toBeInTheDocument();
  });

  it("shows revealed roles as accessible corner icons", () => {
    const masonRole: Role = {
      id: "mason",
      name: "Mason",
      description: "",
      image: "mason.png",
      team: "Villagers",
      member: "Villager",
      abilities: [],
    };

    render(
      <PlayerCard
        player={player}
        key={player.id}
        currentPlayer={{ id: "current-player", name: "Current Player" }}
        currentPhase="Discussion"
        lynchVotes={new Map()}
        players={[player]}
        socket={{ current: { emit: jest.fn() } as unknown as Socket }}
        revealedRole={masonRole}
      />,
    );

    expect(screen.getByRole("img", { name: "Alex is a Mason" })).toBeInTheDocument();
  });
});