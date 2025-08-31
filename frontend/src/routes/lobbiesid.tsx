import { useState } from "react";
import useThemePreference from "../hooks/useThemePreference.ts";
import NameModal from "../components/NameModal.tsx";
import LeaveModal from "../components/LeaveModal.tsx";
import PlayerCard from "../components/PlayerCard.tsx";
import usePeerConnect from "../hooks/usePeerConnect.ts";
import useSocketConnect from "../hooks/useSocketConnect.ts";

export default function Lobbiesid() {
  const [openedDrawer, setOpenedDrawer] = useState(true);
  const [themePreference, setThemePreference] = useThemePreference();

  const [
    players,
    roles,
    currentPlayer,
    currentPhase,
    cards,
    playerStatus,
    gameStarted,
    winner,
    lynchVotes,
    socketRef,
  ] = useSocketConnect();

  usePeerConnect(currentPlayer, players);
  console.log(cards);
  // TODO: opening/closing drawer removes video element

  return (
    <>
      <NameModal socket={socketRef} />
      <div
        className={`drawer h-[92vh] drawer-end ${
          openedDrawer && "drawer-open"
        }`}
      >
        <input
          id="my-drawer-2"
          type="checkbox"
          className="drawer-toggle"
          checked={openedDrawer}
          onChange={() => {
            setOpenedDrawer(!openedDrawer);
          }}
        />
        <div className="drawer-content flex flex-col justify-between">
          <label
            htmlFor="my-drawer-2"
            className={`drawer-button btn btn-primary ${
              openedDrawer && "btn-outline bg-base-200"
            } rounded-2xl absolute ${
              openedDrawer ? "right-[23rem]" : "right-10"
            } transition-all duration-300 top-[23rem] z-10`}
          >
            {openedDrawer ? ">" : "<"}
          </label>

          <div className="flex flex-col items-center justify-center overflow-y-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 p-8 mx-8">
              {players.map((player) => (
                <PlayerCard
                  player={player}
                  key={player.id}
                  currentPlayer={currentPlayer}
                  currentPhase={currentPhase}
                  socket={socketRef}
                  lynchVotes={lynchVotes}
                  stream={new MediaStream()}
                />
              ))}
            </div>

            <div className="toast toast-center toast-middle">
              {/* <div className="alert alert-error">
    <span>The serial killer stabbed {players[0]} (Spirit seer).</span>
  </div> */}
            </div>
          </div>
          <div className="flex items-center sticky bottom-0 gap-12 w-full h-24 p-4 bg-base-200">
            <p>Phase: {currentPhase || "None"}</p>
            <p>Abilities: None</p>
            <p>Winner: {winner || "None"}</p>
            {/* {player.abilities.map((ability: any) => {
                  return (
                    <button
                      className={`btn btn-sm btn-outline ${
                        !ability.enabled && "btn-disabled"
                      }`}
                      onClick={() => {
                        setCurrentAbilityUsing(ability.name);
                      }}
                    >
                      {ability.displayName || ability.name}
                    </button>
                  );
                })} */}
          </div>
        </div>
        <div className="drawer-side h-[92vh]">
          <div className="p-5 h-full min-w-96 max-w-96 bg-base-200">
            <div role="tablist" className="tabs tabs-lifted max-h-screen">
              <input
                type="radio"
                name="sidebar"
                aria-label="Players"
                role="tab"
                className="tab"
                defaultChecked
              />

              <div role="tabpanel" className="tab-content">
                <div className="flex flex-col gap-6 mx-2 my-8">
                  <div className="grid grid-cols-4 items-center p-4 outline outline-2 gap-2 outline-base-300 rounded-lg">
                    {roles.map((role, i) => {
                      // role images not showing up
                      return (
                        <div key={i} className="tooltip" data-tip={role.name}>
                          <img
                            src={`/images/roles/${role.name}.png`}
                            alt={role.name}
                            className={`w-full h-full rounded-lg ${
                              ["Seer", "Mason", "Tanner"].includes(role.name) && "opacity-20"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-3 p-4 outline outline-base-300 outline-2 rounded-lg">
                    <p className="text-center text-lg">Players</p>
                    {players.map((player, i) => {
                      // fix player list not showing up
                      return (
                        <p
                          key={i}
                          className={
                            playerStatus.get(player) === "Alive" || !gameStarted
                              ? ""
                              : "opacity-15"
                          }
                        >
                          {player.name +
                            (playerStatus.get(player) == "Alive" || !gameStarted
                              ? ""
                              : "(dead)")}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              <input
                type="radio"
                name="sidebar"
                aria-label="Settings"
                role="tab"
                className="tab"
              />

              <div role="tabpanel" className="tab-content">
                <div className="flex flex-col gap-6 mx-2 my-8">
                  <div className="flex flex-col gap-3 p-4 outline outline-base-300 outline-2 rounded-lg">
                    <div className="text-center text-lg">Game Settings</div>
                    {["Gamemode: Classic", "Chat: Audio"].map((text, i) => (
                      <div key={i}>{text}</div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 p-4 outline outline-base-300 outline-2 rounded-lg">
                    <div className="text-center text-lg">Theme</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          name: "Default",
                          value: !gameStarted
                            ? "default"
                            : currentPhase !== "Night"
                            ? "light"
                            : "dark",
                        },
                        { name: "Light", value: "light" },
                        { name: "Dark", value: "dark" },
                      ].map((option, i) => (
                        <input
                          type="radio"
                          name="theme-selector"
                          key={i}
                          value={option.value}
                          className="btn btn-outline theme-controller"
                          defaultChecked={themePreference === option.name}
                          onClick={() => setThemePreference(option.name)} // TODO: changing mode removes video element
                          aria-label={option.name}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    className="btn btn-error btn-outline"
                    onClick={() => {
                      const element = document.getElementById(
                        "my_modal_5"
                      ) as HTMLDialogElement;
                      element?.showModal();
                    }}
                  >
                    {currentPlayer && currentPlayer.isHost
                      ? "End Game"
                      : "Leave Game"}
                  </button>
                  <LeaveModal currentPlayer={currentPlayer} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
