import {
  addPlayer,
  addPlayerToLobby,
  createLobby,
  getLobbies,
  getLobbyFromId,
  getPlayerFromId,
  removeLobby,
  removeDisconnectedPlayersFromLobby,
  removePlayer,
  removePlayerFromLobby,
} from "./lobby";

describe("lobby state", () => {
  it("registers players, assigns the first player as host, and transfers host on removal", () => {
    const lobby = createLobby();
    const firstPlayer = { id: `first-${lobby.id}`, name: "First" };
    const secondPlayer = { id: `second-${lobby.id}`, name: "Second" };

    addPlayer(firstPlayer);
    addPlayer(secondPlayer);
    addPlayer({ ...firstPlayer, name: "Duplicate" });
    addPlayerToLobby(lobby, firstPlayer.id);
    addPlayerToLobby(lobby, secondPlayer.id);

    expect(getPlayerFromId(firstPlayer.id)?.name).toBe("First");
    expect(getLobbyFromId(lobby.id)).toBe(lobby);
    expect(lobby.hostId).toBe(firstPlayer.id);

    removePlayerFromLobby(lobby, firstPlayer.id);
    expect(lobby.hostId).toBe(secondPlayer.id);
    removePlayerFromLobby(lobby, "missing-player");
    expect(lobby.players).toEqual([secondPlayer.id]);

    removePlayer(firstPlayer.id);
    removePlayer("missing-player");
    expect(getPlayerFromId(firstPlayer.id)).toBeUndefined();
    expect(getLobbies()).toContain(lobby);

    removePlayer(secondPlayer.id);
    removeLobby(lobby.id);
    removeLobby("missing-lobby");
    expect(getLobbyFromId(lobby.id)).toBeUndefined();
  });

  it("removes disconnected players from the lobby and player registry", () => {
    const lobby = createLobby();
    const connectedPlayer = { id: `connected-${lobby.id}`, name: "Connected" };
    const disconnectedPlayer = {
      id: `disconnected-${lobby.id}`,
      name: "Disconnected",
      connected: false,
    };

    addPlayer(connectedPlayer);
    addPlayer(disconnectedPlayer);
    addPlayerToLobby(lobby, connectedPlayer.id);
    addPlayerToLobby(lobby, disconnectedPlayer.id);

    removeDisconnectedPlayersFromLobby(lobby);

    expect(lobby.players).toEqual([connectedPlayer.id]);
    expect(lobby.hostId).toBe(connectedPlayer.id);
    expect(getPlayerFromId(disconnectedPlayer.id)).toBeUndefined();

    removePlayer(connectedPlayer.id);
    removeLobby(lobby.id);
  });
});