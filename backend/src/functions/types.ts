export type PlayerStatus = "Alive" | "Dead";

export type RoundStatus = "PreGame" | "Night" | "Discussion" | "Voting" | "End";

export type Team = "Villagers" | "Werewolves" | "Solo";

export type Player = {
  id: string;
  name: string;
  socket?: any;
};

export type Lobby = {
  id: string;
  createdAt?: number;
  players: Player["id"][];
  hostId?: Player["id"];
  gameStarted: boolean;
  rounds: Round[];
};

export type Round = {
  id: string;
  createdAt: number;
  playerRoles: Map<Player["id"], Role["id"][]>;
  playerStatus: Map<Player["id"], PlayerStatus>;
  options: Options;
  status: RoundStatus;
  teamWinner?: Team[];
  votes?: Map<Player["id"], Player["id"]>;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  image: string;
  team: Team;
  member: "Villager" | "Werewolf";
  abilities: Ability["name"][];
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
  type: "ViewRole" | "ViewTeam" | "ViewAllOfRole" | "SwitchRoles" | "Kill";
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
  preGameDuration: number;
};

export type ErrorResponse = {
  success: boolean;
  message: string;
  timestamp: number;
};
