import LobbyRolesTab from "./LobbyRolesTab";
import LobbySettingsTab from "./LobbySettingsTab";
import LobbyHowToPlayTab from "./LobbyHowToPlayTab";
import { PlayerStatus, RoundStatus } from "../../../backend/src/functions/types";

export default function SideDrawer(props: {
  roles: {name: string, img: string}[];
  players: { id: string; name: string }[];
  playerStatus: Map<string, PlayerStatus>;
  gameStarted: boolean;
  currentPhase: RoundStatus;
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
                    aria-label="Roles"
                    role="tab"
                    className="tab"
                    defaultChecked
                  />
    
                  <div role="tabpanel" className="tab-content">
                    <LobbyRolesTab
                      roles={props.roles}
                      players={props.players}
                      playerStatus={props.playerStatus}
                      gameStarted={props.gameStarted}
                    />
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
    
                  <input
                    type="radio"
                    name="sidebar"
                    aria-label="How To Play"
                    role="tab"
                    className="tab"
                  />
    
                  <div role="tabpanel" className="tab-content">
                    <LobbyHowToPlayTab />
                  </div>
                </div>
              </div>
            </div>
  );
}