import { Socket } from "socket.io";

export type Player = {
  id: string;
  name: string;
  socket: Socket;
};

export type Lobby = {
  id: string;
  createdAt?: number;
  players: Player[];
  hostId?: Player["id"];
  gameStarted: boolean;
  rounds: Round[];
};

export type Round = {
  id: string;
  createdAt: number;
  cards: Card[];
  playerRoles: Map<Player, Role[]>;
  playerStatus: Map<Player, "Alive" | "Dead">;
  options: Options;
  status: "Begin" | "Night phase" | "Day phase" | "Voting" | "Completed";
  teamWinner?: ("Villagers" | "Werewolves" | "Tanner")[];
  votes?: Map<Player["id"], Player["id"]>;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  image: string;
  team: "Villagers" | "Werewolves" | "Solo";
  member: "Villager" | "Werewolf";
  abilities: Ability["name"][];
};

export type Card = {
  id: string;
  role: Role;
  centerIndex?: number;
  belongsTo?: Player;
};

export type Ability = {
  id: string;
  name: string;
  description: string;
  optional: boolean;
  actions: Action[][];
  conditions?: {
    phase?: Round["status"];
    playerStatus?: "Alive" | "Dead";
    queue?: number;
    other?: "SoleWerewolf";
  };
};

export type Action = {
  name: "ViewRole" | "ViewTeam" | "ViewAllOfRole" | "Switch" | "Kill";
  target:
    | "Center"
    | "Player"
    | "Werewolves"
    | "NotWerewolves"
    | "Any"
    | "Voting"
    | "Player-Player"
    | "Player-Self"
    | "Player-Center"
    | "Self-Center";
  exclusions: ("NotSelf" | "SelfOnly" | "NotWerewolf" | "WerewolfOnly")[];
};

export type Gamemode = {
  name: string;
  roles: string[];
};

export type Options = {
  discussionDuration: number;
  votingDuration: number;
  actionDuration: number;
  resultsDuration: number;
};

export type ErrorResponse = {
  success: boolean;
  message: string;
  timestamp: number;
};
