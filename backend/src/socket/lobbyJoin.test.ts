import { Server, Socket } from "socket.io";
import {
  addPlayer,
  addPlayerToLobby,
  createLobby,
  MAX_PLAYER_COUNT,
  removeLobby,
  removePlayer,
} from "../lobby/lobby";
import { Lobby, Player } from "../game/types";
import { registerLobbyJoinHandler } from "./lobbyJoin";

describe("lobby join admission", () => {
  function setupJoin(lobby: Lobby) {
    const handlers = new Map<string, (...args: any[]) => void>();
    const socket = {
      on: jest.fn((event: string, handler: (...args: any[]) => void) => {
        handlers.set(event, handler);
      }),
      join: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;
    const io = {
      to: jest.fn(() => ({ emit: jest.fn() })),
    } as unknown as Server;

    registerLobbyJoinHandler(io, socket);

    const callback = jest.fn();
    handlers.get("lobbyjoin")?.(lobby.id, "New Player", callback);

    return { callback, socket };
  }

  function addLobbyPlayer(lobby: Lobby, id: string) {
    const player: Player = { id, name: id, connected: true };
    addPlayer(player);
    addPlayerToLobby(lobby, id);
  }

  it("rejects a new player after the game has started", () => {
    const lobby = createLobby();
    addLobbyPlayer(lobby, `host-${lobby.id}`);
    lobby.gameStarted = true;

    const { callback, socket } = setupJoin(lobby);

    expect(callback).toHaveBeenCalledWith({
      isValidId: false,
      error: "Game already in progress",
    });
    expect(lobby.players).toHaveLength(1);
    expect(socket.join).not.toHaveBeenCalled();

    removePlayer(lobby.players[0]);
    removeLobby(lobby.id);
  });

  it("rejects a new player when all participant slots are occupied", () => {
    const lobby = createLobby();
    Array.from({ length: MAX_PLAYER_COUNT }, (_, index) =>
      addLobbyPlayer(lobby, `player-${lobby.id}-${index}`)
    );

    const { callback, socket } = setupJoin(lobby);

    expect(callback).toHaveBeenCalledWith({ isValidId: false, error: "Lobby is full" });
    expect(lobby.players).toHaveLength(MAX_PLAYER_COUNT);
    expect(socket.join).not.toHaveBeenCalled();

    lobby.players.forEach(removePlayer);
    removeLobby(lobby.id);
  });
});