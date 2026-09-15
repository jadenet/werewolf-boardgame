import LeaveModal from "../modals/LeaveModal.tsx";
import { Round } from "../../../Interfaces.ts";

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
    <div className="mx-2 my-4 flex flex-col gap-4">
      <div className="rounded-2xl border border-base-300 bg-base-100/50 p-4 shadow-lg backdrop-blur-sm">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">Theme</p>
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
