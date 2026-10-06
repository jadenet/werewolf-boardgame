import { renderHook, waitFor } from "@testing-library/react";
import { MutableRefObject } from "react";
import { Socket } from "socket.io-client";
import useLobbyFeed from "./useLobbyFeed";

describe("useLobbyFeed winner messages", () => {
  it("posts a Villagers win alert into lobby chat", async () => {
    const socketRef = { current: null } as MutableRefObject<Socket | null>;
    const winnerAlert = {
      tone: "success" as const,
      title: "Game over",
      message: "The Villagers win!",
    };
    const { result } = renderHook(() =>
      useLobbyFeed(socketRef, "player-one", "End", true, winnerAlert),
    );

    await waitFor(() => {
      expect(result.current.chatMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "system",
            message: "Game over: The Villagers win!",
          }),
        ]),
      );
    });
  });
});