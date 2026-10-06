import { fireEvent, render, screen } from "@testing-library/react";
import GameOverModal from "./GameOverModal";

describe("GameOverModal", () => {
  it("shows the winner and replay vote inline without a blocking modal", () => {
    const onPlayAgainVote = jest.fn();
    render(
      <GameOverModal
        winner={["Villagers"]}
        playAgainStatus={{ votes: 1, required: 2 }}
        onPlayAgainVote={onPlayAgainVote}
      />,
    );

    expect(screen.getByRole("region", { name: "Game results" })).toBeInTheDocument();
    expect(screen.getByText("The Villagers win!")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play Again (1/2)" }));
    expect(onPlayAgainVote).toHaveBeenCalledTimes(1);
  });
});