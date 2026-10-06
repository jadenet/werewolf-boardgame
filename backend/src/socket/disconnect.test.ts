import { Server, Socket } from "socket.io";
import {
  addPlayer,
  addPlayerToLobby,
  createLobby,
  getPlayerFromId,
  removeLobby,
  removePlayer,
} from "../lobby/lobby";
import { Lobby, Player } from "../game/types";
import { cancelPendingDisconnect, registerDisconnectHandler } from "./disconnect";

describe("lobby socket disconnect handling", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createConnectedPlayer() {
    const lobby = createLobby();
    const player: Player = { id: `player-${lobby.id}`, name: "Host", connected: true };
    addPlayer(player);
    addPlayerToLobby(lobby, player.id);

    const handlers = new Map<string, (...args: unknown[]) => void>();
    const socket = {
      on: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
        handlers.set(event, handler);
      }),
    } as unknown as Socket;
    const io = {
      to: jest.fn(() => ({ emit: jest.fn() })),
    } as unknown as Server;

    registerDisconnectHandler(io, socket, lobby, player);
    return { handlers, io, lobby, player };
  }

  it("keeps a pre-game player reserved until the reconnect grace period expires", () => {
    const { handlers, lobby, player } = createConnectedPlayer();

    handlers.get("disconnect")?.();

    expect(player.connected).toBe(false);
    expect(lobby.players).toContain(player.id);
    expect(getPlayerFromId(player.id)).toBe(player);

    jest.advanceTimersByTime(60_000);

    expect(lobby.players).not.toContain(player.id);
    expect(getPlayerFromId(player.id)).toBeUndefined();
  });

  it("cancels deferred removal when the player reconnects", () => {
    const { handlers, lobby, player } = createConnectedPlayer();

    handlers.get("disconnect")?.();
    player.connected = true;
    cancelPendingDisconnect(player.id);
    jest.advanceTimersByTime(60_000);

    expect(lobby.players).toContain(player.id);
    expect(getPlayerFromId(player.id)).toBe(player);

    removePlayer(player.id);
    removeLobby(lobby.id);
  });
});