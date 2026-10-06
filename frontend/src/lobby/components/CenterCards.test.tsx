import { fireEvent, render, screen } from "@testing-library/react";
import CenterCards from "./CenterCards";

describe("CenterCards", () => {
  it("shows three cards, reveals provided roles, and selects only valid targets", () => {
    const onSelect = jest.fn();
    render(
      <CenterCards
        validTargetIds={["center-0"]}
        selectedTargetIds={["center-0"]}
        onSelect={onSelect}
        revealedRoles={[
          { name: "Seer" },
          { name: "Villager" },
        ] as never}
      />,
    );

    expect(screen.getByText("Seer")).toBeInTheDocument();
    expect(screen.getByText("Villager")).toBeInTheDocument();
    expect(screen.getAllByText(/Card [123]/)).toHaveLength(3);

    fireEvent.click(screen.getByText("Card 1").parentElement!);
    fireEvent.click(screen.getByText("Card 2").parentElement!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("center-0");
  });

  it("renders unrevealed cards face down", () => {
    render(<CenterCards selectedTargetIds={[]} revealedRoles={null} />);

    expect(screen.getAllByText("🂠")).toHaveLength(3);
  });
});