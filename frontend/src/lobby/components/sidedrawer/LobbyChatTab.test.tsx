import { render, screen } from "@testing-library/react";
import LobbyChatTab from "./LobbyChatTab";

describe("LobbyChatTab", () => {
  it("allows long unbroken messages to wrap within the chat feed", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn(),
    });
    const longMessage = "word".repeat(500);

    render(
      <LobbyChatTab
        messages={[{ id: "long", kind: "player", playerName: "Player", message: longMessage, timestamp: 0 }]}
        currentPhase="Discussion"
        chatInput=""
        onChatInputChange={jest.fn()}
        onSendMessage={jest.fn()}
      />,
    );

    expect(screen.getByText(longMessage)).toHaveClass("[overflow-wrap:anywhere]");
  });
});