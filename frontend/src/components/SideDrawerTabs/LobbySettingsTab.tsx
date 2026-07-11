import LeaveModal from "../LeaveModal.tsx";
import { Round } from "../../Interfaces.ts";

export default function LobbySettingsTab(props: {
  playersCount: number;
  gameStarted: boolean;
  currentPhase: Round["status"];
  themePreference: string;
  setThemePreference: (theme: string) => void;
  currentPlayer: { id: string | null; name: string | null; isHost?: boolean };
}) {
  const defaultValue = !props.gameStarted
    ? "default"
    : props.currentPhase !== "Night"
      ? "light"
      : "dark";
  return (
    <div className="flex flex-col gap-6 mx-2 my-8">
      <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 rounded-xl p-4 shadow-lg">
        <h4 className="text-lg font-semibold mb-4 text-center">Theme</h4>
        <div className="grid grid-cols-1 gap-2">
          {[
            { name: "Default", value: defaultValue },
            { name: "Light", value: "light" },
            { name: "Dark", value: "dark" },
          ].map((option, i) => (
            <input
              type="radio"
              name="theme-selector"
              key={i}
              value={option.value}
              className="btn btn-outline btn-sm theme-controller w-full"
              defaultChecked={props.themePreference === option.name}
              onClick={() => props.setThemePreference(option.name)}
              aria-label={option.name}
            />
          ))}
        </div>
      </div>

      <button
        className="btn btn-error btn-outline w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        onClick={() => {
          const element = document.getElementById(
            "my_modal_5",
          ) as HTMLDialogElement;
          element?.showModal();
        }}
      >
        {props.currentPlayer && props.currentPlayer.isHost
          ? "End Game"
          : "Leave Game"}
      </button>
      <LeaveModal currentPlayer={props.currentPlayer} />
    </div>
  );
}
