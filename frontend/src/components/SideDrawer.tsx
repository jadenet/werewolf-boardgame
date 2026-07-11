import LobbyChatTab from "./SideDrawerTabs/LobbyChatTab";
import LobbySettingsTab from "./SideDrawerTabs/LobbySettingsTab";
import LobbyRulesTab from "./SideDrawerTabs/LobbyRulesTab";
import {
  PlayerStatus,
  RoundStatus,
} from "../../../backend/src/functions/types";

export default function SideDrawer(props: {
  roles: { name: string; img: string }[];
  players: { id: string; name: string }[];
  playerStatus: Map<string, PlayerStatus>;
  gameStarted: boolean;
  currentPhase: RoundStatus;
  chatMessages: {
    id: string;
    kind: "player" | "system";
    playerName: string;
    message: string;
    timestamp: number;
  }[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  themePreference: string;
  setThemePreference: (theme: string) => void;
  currentPlayer: { id: string; name: string };
}) {
  return (
    <div className="drawer-side h-[92vh]">
      <div className="p-5 h-full min-w-96 max-w-96 bg-base-200/95 backdrop-blur-md">
        <div role="tablist" className="tabs tabs-lifted max-h-screen">
          <input
            type="radio"
            name="sidebar"
            aria-label="Chat"
            role="tab"
            className="tab"
            defaultChecked
          />

          <div role="tabpanel" className="tab-content">
            <LobbyChatTab
              messages={props.chatMessages}
              currentPhase={props.currentPhase}
              chatInput={props.chatInput}
              onChatInputChange={props.onChatInputChange}
              onSendMessage={props.onSendMessage}
            />
          </div>

          <input
            type="radio"
            name="sidebar"
            aria-label="Rules"
            role="tab"
            className="tab"
          />

          <div role="tabpanel" className="tab-content">
            <LobbyRulesTab roles={props.roles} />
          </div>

          <input
            type="radio"
            name="sidebar"
            aria-label="Settings"
            role="tab"
            className="tab"
          />

          <div role="tabpanel" className="tab-content">
            <LobbySettingsTab
              playersCount={props.players.length}
              gameStarted={props.gameStarted}
              currentPhase={props.currentPhase}
              themePreference={props.themePreference}
              setThemePreference={props.setThemePreference}
              currentPlayer={props.currentPlayer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
