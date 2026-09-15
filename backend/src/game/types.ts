export type PlayerStatus = "Alive" | "Dead";

export type RoundStatus = "PreGame" | "Night" | "Discussion" | "Voting" | "End";

export type Team = "Villagers" | "Werewolves" | "Solo";

export type Player = {
  id: string;
  name: string;
  socket?: any;
  isBot?: boolean;
  connected?: boolean;
};

export type Lobby = {
  id: string;
  createdAt?: number;
  players: Player["id"][];
  hostId?: Player["id"];
  gameStarted: boolean;
  rounds: Round[];
  // Roles the host has configured for this lobby; empty means "use the recommended set".
  selectedRoleIds: Role["id"][];
};

export type Round = {
  id: string;
  createdAt: number;
  playerRoles: Map<Player["id"], Role["id"][]>;
  playerStatus: Map<Player["id"], PlayerStatus>;
  // The 3 unused role cards left face-down in the center of the table.
  centerRoles: Role["id"][];
  status: RoundStatus;
  options: Options;
  phaseDeadlineAt?: number;
  teamWinner?: Team[];
  // Key is voter player id, value is target player id.
  votes?: Map<Player["id"], Player["id"]>;
};

// Progress of a majority vote (discussion skip, play again, etc).
export type VoteStatus = {
  votes: number;
  required: number;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  image: string;
  team: Team;
  member: "Villager" | "Werewolf";
  abilities: Ability["id"][];
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
    other?: "SoleWerewolf" | "SoleWerewolf"[];
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
    | "Self"
    | "Player-Player"
    | "Player-Self"
    | "Player-Center"
    | "Self-Center"
    | Role["name"];
  exclusions: ("NotSelf" | "SelfOnly" | "NotWerewolf" | "WerewolfOnly")[];
  // Overrides the default number of selections required for this action's target type.
  count?: number;
};

export type AbilityPrompt = {
  abilityId: Ability["id"];
  abilityName: Ability["name"];
  message: string;
  target: Action["target"];
  exclusions: Action["exclusions"];
  queue: number;
  requiredSelections: number;
  validTargetIds: Player["id"][];
};

export type AbilityPromptResponse = {
  selectedPlayerIds: Player["id"][];
};

export type AbilityResult = {
  abilityId: Ability["id"];
  title: string;
  message: string;
  tone: "info" | "success" | "warning";
  // Structured player ids revealed by this ability (e.g. fellow werewolves), for building
  // persistent UI instead of parsing the message text.
  revealedPlayerIds?: Player["id"][];
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
