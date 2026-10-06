import { Server, Socket } from "socket.io";
import { addPlayer, addPlayerToLobby, createLobby, removeLobby, removePlayer } from "../../lobby/lobby";
import { Lobby, Player } from "../types";
import playAgainPhase from "./playAgain";

function createSocketHarness() {
  const handlers = new Map<string, () => void>();
  const socket = {
    emit: jest.fn(),
    once: jest.fn((event: string, handler: () => void) => {
      const onceHandler = () => {
        handlers.delete(event);
        handler();
      };
      handlers.set(event, onceHandler);
    }),
    off: jest.fn((event: string) => handlers.delete(event)),
  } as unknown as Socket;
  return {
    socket,
    trigger(event: string) {
      handlers.get(event)?.();
    },
    has(event: string) {
      return handlers.has(event);
    },
  };
}

function addLobbyPlayers(lobby: Lobby, ids: string[]) {
  const sockets = ids.map(() => createSocketHarness());
  ids.forEach((id, index) => {
    const player: Player = {
      id,
      name: id,
      isBot: id.startsWith("bot"),
      socket: sockets[index].socket,
    };
    addPlayer(player);
    addPlayerToLobby(lobby, id);
  });
  return sockets;
}

describe("playAgainPhase", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("counts only human replay votes", async () => {
    const lobby = createLobby();
    const ids = ["human-one", "human-two", "bot-one"];
    const sockets = addLobbyPlayers(lobby, ids);
    const broadcast = { emit: jest.fn() };
    const io = { to: jest.fn(() => broadcast) } as unknown as Server;

    const resultPromise = playAgainPhase(lobby, io);
    expect(sockets[2].has("playAgainVote")).toBe(false);
    sockets[0].trigger("playAgainVote");
    expect(broadcast.emit).toHaveBeenLastCalledWith("playAgainVoteUpdate", { votes: 1, required: 2 });
    sockets[2].trigger("playAgainVote");
    sockets[1].trigger("playAgainVote");

    await expect(resultPromise).resolves.toBe(true);
    ids.forEach(removePlayer);
    removeLobby(lobby.id);
  });

  it("does not replay when nobody votes", async () => {
    const lobby = createLobby();
    const ids = ["human-one", "bot-one"];
    const sockets = addLobbyPlayers(lobby, ids);
    const io = { to: jest.fn(() => ({ emit: jest.fn() })) } as unknown as Server;

    const resultPromise = playAgainPhase(lobby, io);
    await jest.advanceTimersByTimeAsync(30_000);

    await expect(resultPromise).resolves.toBe(false);
    expect(sockets[1].has("playAgainVote")).toBe(false);
    ids.forEach(removePlayer);
    removeLobby(lobby.id);
  });
});