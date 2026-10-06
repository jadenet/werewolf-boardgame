import { Socket } from "socket.io";
import { addPlayer, addPlayerToLobby, createLobby, removeLobby, removePlayer } from "../../lobby/lobby";
import { Lobby, Player, Round } from "../types";
import votingPhase from "./voting";

function createSocketHarness() {
  const handlers = new Map<string, Set<(...args: any[]) => void>>();
  const socket = {
    on: jest.fn((event: string, handler: (...args: any[]) => void) => {
      const listeners = handlers.get(event) ?? new Set();
      listeners.add(handler);
      handlers.set(event, listeners);
    }),
    once: jest.fn((event: string, handler: (...args: any[]) => void) => {
      const onceHandler = (...args: any[]) => {
        socket.off(event, onceHandler);
        handler(...args);
      };
      socket.on(event, onceHandler);
    }),
    off: jest.fn((event: string, handler: (...args: any[]) => void) => {
      handlers.get(event)?.delete(handler);
    }),
    emit: jest.fn(),
  } as unknown as Socket;

  return {
    socket,
    trigger(event: string, ...args: any[]) {
      [...(handlers.get(event) ?? [])].forEach((handler) => handler(...args));
    },
    listenerCount(event: string) {
      return handlers.get(event)?.size ?? 0;
    },
  };
}

describe("votingPhase", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("accepts changed votes until the voting timer expires", async () => {
    const lobby: Lobby = createLobby();
    const players = ["player-one", "player-two", "player-three"];
    const sockets = players.map(() => createSocketHarness());
    players.forEach((id, index) => {
      const player: Player = { id, name: id, socket: sockets[index].socket, connected: true };
      addPlayer(player);
      addPlayerToLobby(lobby, id);
    });

    const round: Round = {
      id: "round",
      createdAt: Date.now(),
      playerRoles: new Map(players.map((id) => [id, ["villager"]])),
      playerStatus: new Map(players.map((id) => [id, "Alive"])),
      centerRoles: [],
      status: "Voting",
      options: { discussionDuration: 1, votingDuration: 10, actionDuration: 1, resultsDuration: 1, preGameDuration: 1 },
    };

    let phaseResolved = false;
    const phasePromise = votingPhase(players, round).then((votes) => {
      phaseResolved = true;
      return votes;
    });

    sockets[0].trigger("vote", players[1]);
    sockets[1].trigger("vote", players[0]);
    sockets[2].trigger("vote", players[1]);

    expect(phaseResolved).toBe(false);
    expect(sockets[0].listenerCount("vote")).toBe(1);

    sockets[0].trigger("vote", players[2]);
    await jest.advanceTimersByTimeAsync(10_000);

    await expect(phasePromise).resolves.toEqual(new Map([
      [players[0], players[2]],
      [players[1], players[0]],
      [players[2], players[1]],
    ]));
    expect(sockets[0].listenerCount("vote")).toBe(0);

    players.forEach(removePlayer);
    removeLobby(lobby.id);
  });
});