import { Lobby, Player } from "./Interfaces";

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

export function addPlayerToLobby(lobby: Lobby, player: Player) {
  if (lobby.players.length === 0) {
    lobby.hostId = player.id;
  }
  lobby.players.push(player);
}

export function removePlayerFromLobby(lobby: Lobby, player: Player) {
  const playerIndex = findPlayerFromLobby(lobby, player);
  playerIndex !== -1 && lobby.players.splice(playerIndex, 1);
}

export function findPlayerFromLobby(lobby: Lobby, player: Player) {
  const playerIndex = lobby.players.findIndex(
    (playerInLobby) => player.id === playerInLobby.id
  );
  return playerIndex;
}

export function findPlayerFromId(players: Player[], playerId: Player["id"]) {
  const player = players.find((player) => {
    return player.id === playerId;
  });
  return player;
}

export function getLobbyFromId(lobbies: Lobby[], id: Lobby["id"]) {
  return lobbies.find((lobby) => {
    return lobby.id === id;
  });
}

export function removeLobby(lobbies: Lobby[], lobbyId: Lobby["id"]) {
  const lobbyIndex = lobbies.findIndex((lob) => {
    lob.id === lobbyId;
  });
  if (lobbyIndex != -1) lobbies.splice(lobbyIndex);
}
