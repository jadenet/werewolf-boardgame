import { fireEvent, render, screen } from "@testing-library/react";
import LobbyStatusBar from "./LobbyStatusBar";

describe("LobbyStatusBar", () => {
  it("shows game status and invokes enabled actions", () => {
    const onStartGame = jest.fn();
    const onSkipDiscussion = jest.fn();
    render(
      <LobbyStatusBar
        playersCount={5}
        currentPhase="Discussion Phase"
        currentRoleName="Seer"
        activeAbilityName={null}
        winner={null}
        formattedPhaseCountdown="00:30"
        canStartGame
        onStartGame={onStartGame}
        canSkipDiscussion
        onSkipDiscussion={onSkipDiscussion}
        discussionSkipStatus={{ votes: 2, required: 3 }}
      />,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Discussion Phase")).toBeInTheDocument();
    expect(screen.getByText("Seer")).toBeInTheDocument();
    expect(screen.getByText("00:30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip Discussion (2/3)" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Game" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip Discussion (2/3)" }));
    expect(onStartGame).toHaveBeenCalledTimes(1);
    expect(onSkipDiscussion).toHaveBeenCalledTimes(1);
  });

  it("uses the empty state labels and hides unavailable actions", () => {
    render(
      <LobbyStatusBar
        playersCount={0}
        currentPhase={null}
        currentRoleName={null}
        activeAbilityName={null}
        winner={null}
        formattedPhaseCountdown={null}
        canStartGame={false}
        onStartGame={jest.fn()}
        canSkipDiscussion={false}
        onSkipDiscussion={jest.fn()}
        discussionSkipStatus={null}
      />,
    );

    expect(screen.getAllByText("None")).toHaveLength(2);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});