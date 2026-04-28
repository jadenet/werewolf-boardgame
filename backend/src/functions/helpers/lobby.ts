import { Lobby, Player } from "../types";

const players: Player[] = [];
const lobbies: Lobby[] = [];

export function createLobby() {
  const lobby: Lobby = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    players: [],
    gameStarted: false,
    rounds: [],
  };
  return lobby;
}

export function addPlayerToLobby(lobby: Lobby, playerId: Player["id"]) {
  if (lobby.players.length === 0) {
    lobby.hostId = playerId;
  }
  lobby.players.push(playerId);
}

export function removePlayerFromLobby(lobby: Lobby, playerId: Player["id"]) {
  const playerIndex = lobby.players.findIndex((id) => id === playerId);
  playerIndex !== -1 && lobby.players.splice(playerIndex, 1);
}

export function getPlayerFromId(playerId: Player["id"]) {
  const player = players.find((player) => {
    return player.id === playerId;
  });
  return player;
}

export function getLobbyFromId(lobbyId: Lobby["id"]) {
  return lobbies.find((lobby) => {
    return lobby.id === lobbyId;
  });
}

export function removeLobby(lobbyId: Lobby["id"]) {
  const lobbyIndex = lobbies.findIndex((lob) => {
    return lob.id === lobbyId;
  });
  if (lobbyIndex != -1) lobbies.splice(lobbyIndex, 1);
}
