export interface Ability {
  name: string;
  displayName?: string;
  img: string;
  description?: string;
  conditions: {};
}

export interface Player {
  name: string;
  role?: string;
  status?: string;
  abilities?: Ability[];
}

export interface Lobby {
  id: number;
  createdAt?: Date;
  maxPlayers: number;
  potentialRoles?: [];
  players: Player[];
  playerHost?: number;
  gamemode?: string;
  gameStarted: boolean;
  chatMessages: [];
}
