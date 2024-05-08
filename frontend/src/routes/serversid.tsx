import Chat from "../components/Chat";
import { useEffect, useState } from "react";
import roles from "../../../backend/assets/roles.json";
import { io } from "socket.io-client";
import { useParams } from "wouter";
import { faker } from "@faker-js/faker";

function getTrunucatedString(string: string, max: number) {
  if (string.length > max) {
    return string.substring(0, max - 3) + "...";
  } else {
    return string;
  }
}

const playerName = faker.internet.displayName();

export default function Server() {
  const lobbyId = Number(useParams()["id"]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io("https://werewolf-peom.onrender.com");
    setSocket(socket);

    socket.on("connect", () => {
      socket.emit("lobbyjoin", lobbyId, playerName);
    });

    socket.on("playersChanged", (newPlayers) => {
      setPlayers(newPlayers);
    });

    // socket.on("abilityUsed", (ability) => {});

    socket.on("chatMessage", (message) => {
      setChatMessages([...chatMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const [players, setPlayers] = useState([]);
  const currentPlayer = players.find((player) => player.name == playerName)
  const [chatMessages, setChatMessages] = useState([]);
  const currentPlayerId = null;

  const [openedDrawer, setOpenedDrawer] = useState(true);

  function handleDrawerchange() {
    setOpenedDrawer(!openedDrawer);
  }

  return (
    <div
      className={`drawer min-h-screen drawer-end ${
        openedDrawer && "drawer-open"
      }`}
    >
      <input
        id="my-drawer-2"
        type="checkbox"
        className="drawer-toggle"
        checked={openedDrawer}
        onChange={handleDrawerchange}
      />
      <div className="drawer-content">
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

        {/* <div>{timer}</div> */}

        {/* <div className="w-full mx-96 font-bold text-2xl">
          {!winner
            ? (phase === "Night" && `night: ${nightTime}`) ||
              (phase === "Discussion" && `discussion: ${discussionTime}`) ||
              (phase === "Voting" && `voting: ${votingTime}`) ||
              (phase == "Interlude1" && "Interlude1") ||
              (phase == "Interlude2" && "Interlude2")
            : `Winner: ${winner || "No winner"}`}
        </div>
        <div className="flex flex-col">
          {usedAbilities.map((ability) => {
            return (
              <div>
                {ability.abilityName} {ability.targetedPlayers}{" "}
                {ability.usedBy || "no one"}
              </div>
            );
          })}
        </div> */}

        <div className="flex flex-col items-center justify-center overflow-y-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 p-8 mx-8">
            {players.map((player) => {
              return (
                <div
                  className="relative flex w-56 aspect-square rounded-2xl"
                  onClick={() => {
                    socket.emit("playerClicked", currentPlayer, player);
                  }}
                >
                  <button className="btn btn-ghost absolute top-0 right-0 text-lg">
                    ...
                  </button>
                  <div className="w-full h-full bg-secondary opacity-5 rounded-2xl"></div>
                  <div
                    className={`${
                      player.name === currentPlayer.name && "bg-red-500"
                    } absolute flex justify-between items-center p-3 bg-secondary-content bg-opacity-30 w-full text-center bottom-0 rounded-b-2xl`}
                  >
                    <div className="tooltip" data-tip={player.name}>
                      <p className="text-sm">
                        {getTrunucatedString(player.name, 18)}
                      </p>
                      <p>{player.status}</p>
                      <p>{player.role}</p>
                    </div>
                    <label className="swap">
                      <input type="checkbox" defaultChecked />

                      <svg
                        className="swap-on fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
                      </svg>

                      <svg
                        className="swap-off fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z" />
                      </svg>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="toast toast-center toast-middle">
            {/* <div className="alert alert-error">
    <span>The serial killer stabbed {players[0]} (Spirit seer).</span>
  </div> */}
          </div>
        </div>
        <div>
          abilities
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
      <div className="drawer-side">
        <div className="p-5 h-full min-w-96 max-w-96 bg-base-200">
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
              <Chat
                chatMessages={chatMessages}
                currentPlayerId={currentPlayerId}
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
              <div className="flex flex-col gap-6 mx-2 my-8">
                <div className="grid grid-cols-5 items-center p-4 outline outline-2 outline-base-300 h-40 gap-x-4 rounded-lg">
                  {roles.map((role) => {
                    return (
                      <div className="tooltip" data-tip={role.name}>
                        <img
                          src={`/images/roles/${role.img}`}
                          alt={role.name}
                          className={`w-full aspect-square object-contain ${
                            role.name === "Aura Seer" && "opacity-20"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-3 p-4 outline outline-base-300 outline-2 rounded-lg">
                  <p className="text-center text-lg">Players</p>
                  {players.map((player) => {
                    return <div>{player.name}</div>;
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
                  <div>Gamemode: Wild</div>
                  <div>Max players: 16</div>
                  <div>Age: 16+</div>
                  <div>Chat: Mic only</div>
                  <div>Tone: Casual</div>
                  <div>Languages: English</div>
                </div>

                <div className="flex flex-col gap-4 p-4 outline outline-base-300 outline-2 rounded-lg">
                  <div className="text-center text-lg">Volume</div>
                  <input
                    type="range"
                    min={0}
                    max="100"
                    defaultValue="80"
                    className="range"
                  />
                  <div className="w-full flex justify-between text-xs px-2">
                    <span>0</span>
                    <span>20</span>
                    <span>40</span>
                    <span>60</span>
                    <span>80</span>
                    <span>100</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-4 outline outline-base-300 outline-2 rounded-lg">
                  <div className="text-center text-lg">Theme</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="btn btn-primary">Dynamic</button>
                    <button className="btn btn-outline">Light</button>
                    <button className="btn btn-outline">Dark</button>
                  </div>
                </div>

                <div className="btn btn-error btn-outline">Leave/End game</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
