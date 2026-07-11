import { Player, Round } from "../Interfaces";

export default function LobbyRolesTab(props: {
  roles: { name: string; img: string }[];
  players: Player[];
  playerStatus: Round["playerStatus"];
  gameStarted: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 mx-2 my-8">
      <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
        <h4 className="text-lg font-semibold mb-4 text-center">Available Roles</h4>
        <div className="grid grid-cols-4 items-center gap-2">
          {props.roles.map((role, i) => {
            return (
              <div key={i} className="tooltip tooltip-bottom" data-tip={role.name}>
                <div className={`avatar ${["Seer", "Mason", "Tanner"].includes(role.name) && "opacity-50"}`}>
                  <div className="w-12 h-12 rounded-lg ring ring-base-300 ring-offset-1 ring-offset-base-100">
                    <img
                      src={`/images/roles/${role.name}.png`}
                      alt={role.name}
                      className="object-contain p-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
        <h4 className="text-lg font-semibold mb-4 text-center">Players</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {props.players.map((player, i) => {
            const isAlive = props.playerStatus.get(player.id) === "Alive" || !props.gameStarted;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isAlive
                    ? "bg-base-100/70"
                    : "bg-base-300/50 opacity-60"
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  isAlive ? "bg-success" : "bg-error"
                }`}></div>
                <span className={`font-medium ${!isAlive && "line-through"}`}>
                  {player.name}
                  {!isAlive && " (Eliminated)"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
