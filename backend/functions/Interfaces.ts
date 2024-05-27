export interface Ability {
  name: string;
  displayName?: string;
  img: string;
  description?: string;
  conditions: {};
}

export interface Player {
  id: string;
  name: string;
  role?: string;
  status?: string;
  abilities?: Ability[];
  isHost: boolean
}

export interface Lobby {
  id: string;
  createdAt?: Date;
  maxPlayers: number;
  potentialRoles?: any[];
  players: Player[];
  playerHost?: number;
  gamemode?: string;
  gameStarted: boolean;
}

export interface Gamemode {
  name: string;
  role_percentages: { werewolves: number; solos: number; villagers: number };
  roles: string[];
}
