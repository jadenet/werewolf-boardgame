import LobbyChatTab from "./LobbyChatTab";
import LobbySettingsTab from "./LobbySettingsTab";
import LobbyRulesTab from "./LobbyRulesTab";
import PlayersTab from "./PlayersTab";
import { Player, PlayerStatus, Role, RoundStatus } from "../../../Interfaces";

export default function SideDrawer(props: {
  roles: { name: string; img: string }[];
  roleCatalog: Role[];
  selectedRoleIds: Role["id"][];
  players: Player[];
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
  currentPlayer: { id: string; name: string; isHost?: boolean };
  isPlayerMuted: (playerId: Player["id"]) => boolean;
  onTogglePlayerMute: (playerId: Player["id"]) => void;
  getPlayerVolume: (playerId: Player["id"]) => number;
  onPlayerVolumeChange: (playerId: Player["id"], volume: number) => void;
  onRemoveBot: (playerId: Player["id"]) => void;
  onKickPlayer: (playerId: string[]) => void;
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
            aria-label="Players"
            role="tab"
            className="tab"
          />

          <div role="tabpanel" className="tab-content">
            <PlayersTab
              players={props.players}
              currentPlayerId={props.currentPlayer.id}
              isHost={Boolean(props.currentPlayer.isHost)}
              gameStarted={props.gameStarted}
              playerStatus={props.playerStatus}
              isPlayerMuted={props.isPlayerMuted}
              onToggleMute={props.onTogglePlayerMute}
              getPlayerVolume={props.getPlayerVolume}
              onVolumeChange={props.onPlayerVolumeChange}
              onRemoveBot={props.onRemoveBot}
              onKickPlayer={props.onKickPlayer}
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
            <LobbyRulesTab />
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
