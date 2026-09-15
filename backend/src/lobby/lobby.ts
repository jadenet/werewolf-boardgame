import { Lobby, Player } from "../game/types";
import BotSocket from "./botSocket";

const players: Player[] = [];
const lobbies: Lobby[] = [];

const BOT_NAMES = [
  "Bot Ashley", "Bot Marcus", "Bot Priya", "Bot Diego", "Bot Yuki",
  "Bot Fatima", "Bot Owen", "Bot Sana", "Bot Lucas", "Bot Nadia",
];

export function createBotPlayer(lobby: Lobby) {
  const usedNames = new Set(
    lobby.players.map((playerId) => getPlayerFromId(playerId)?.name)
  );
  const availableName = BOT_NAMES.find((name) => !usedNames.has(name))
    ?? `Bot ${Math.floor(Math.random() * 10000)}`;

  const bot: Player = {
    id: crypto.randomUUID(),
    name: availableName,
    isBot: true,
    connected: true,
  };
  bot.socket = new BotSocket(lobby, bot.id);

  addPlayer(bot);
  addPlayerToLobby(lobby, bot.id);

  return bot;
}

export function createLobby() {
  const lobby: Lobby = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    players: [],
    gameStarted: false,
    rounds: [],
    selectedRoleIds: [],
  };

  lobbies.push(lobby);
  
  return lobby;
}
export function getLobbies() {
  return lobbies;
}

export function addPlayerToLobby(lobby: Lobby, playerId: Player["id"]) {
  if (lobby.players.length === 0) {
    lobby.hostId = playerId;
  }
  lobby.players.push(playerId);
}

export function addPlayer(player: Player) {
  const existingPlayer = players.find((p) => p.id === player.id);
  if (!existingPlayer) {
    players.push(player);
  }
}

export function removePlayerFromLobby(lobby: Lobby, playerId: Player["id"]) {
  const playerIndex = lobby.players.findIndex((id) => id === playerId);
  if (playerIndex === -1) {
    return;
  }

  lobby.players.splice(playerIndex, 1);

  if (lobby.hostId === playerId) {
    lobby.hostId = lobby.players[0];
  }
}

export function getPlayerFromId(playerId: Player["id"]) {
  const player = players.find((player) => {
    return player.id === playerId;
  });
  return player;
}

export function removePlayer(playerId: Player["id"]) {
  const playerIndex = players.findIndex((player) => player.id === playerId);
  if (playerIndex !== -1) {
    players.splice(playerIndex, 1);
  }
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
