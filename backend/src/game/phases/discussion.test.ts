import { Server, Socket } from "socket.io";
import { addPlayer, addPlayerToLobby, createLobby, removeLobby, removePlayer } from "../../lobby/lobby";
import { Lobby, Player } from "../types";
import discussionPhase from "./discussion";

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

describe("discussionPhase", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("requires a human majority and does not listen for bot skips", async () => {
    const lobby: Lobby = createLobby();
    const ids = ["human-one", "human-two", "bot-one"];
    const sockets = ids.map(() => createSocketHarness());
    ids.forEach((id, index) => {
      const player: Player = {
        id,
        name: id,
        isBot: id === "bot-one",
        socket: sockets[index].socket,
      };
      addPlayer(player);
      addPlayerToLobby(lobby, id);
    });
    const broadcast = { emit: jest.fn() };
    const io = { to: jest.fn(() => broadcast) } as unknown as Server;

    let resolved = false;
    const phasePromise = discussionPhase(ids, 60, io, lobby.id).then(() => {
      resolved = true;
    });

    expect(sockets[2].has("discussionSkip")).toBe(false);
    sockets[0].trigger("discussionSkip");
    expect(resolved).toBe(false);
    expect(broadcast.emit).toHaveBeenLastCalledWith("discussionSkipUpdate", { votes: 1, required: 2 });

    sockets[1].trigger("discussionSkip");
    await phasePromise;
    expect(resolved).toBe(true);

    ids.forEach(removePlayer);
    removeLobby(lobby.id);
  });
});