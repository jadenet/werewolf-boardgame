"use client";

import { useMemo, useState } from "react";
import roles from "../../../backend/assets/roles.json";
import { useLocation } from "wouter";

const chats = ["Audio", "Video"];
const visibilityTypes = ["Public", "Invite Only"];
const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://werewolf-backend.onrender.com"
    : "http://localhost:10000";

const gamemodes = [
  {
    name: "Classic",
    role_percentages: { werewolves: 5, solos: 5, villagers: 90 },
    roles: roles.map((role) => {
      return role.name;
    }),
  },
  {
    name: "Custom",
    role_percentages: { werewolves: 5, solos: 5, villagers: 90 },
    roles: [],
  },
];

const villageRoles = roles
  .filter((role) => {
    return role.team[0] === "Village";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

const werewolfRoles = roles
  .filter((role) => {
    return role.team[0] === "Werewolves";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

const soloRoles = roles
  .filter((role) => {
    return role.team[0] === "Solo";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

export default function CreateLobby() {
  const [currentGamemode, setCurrentGamemode]: any = useState(gamemodes[0]);
  const [currentRoles, setCurrentRoles]: any = useState(gamemodes[0].roles);
  const [hostPlayerName, setHostPlayerName]: any = useState("");
  const [formErrors, setFormErrors]: any = useState([]);
  const [location, setLocation] = useLocation();
  const customGamemode = useMemo(() => currentRoles, [currentRoles]);
  gamemodes[1].roles = customGamemode;

  function checkCurrentGamemode(e: any) {
    const newRoles = [...currentRoles];
    if (e.target.checked) {
      newRoles.push(e.target.value);
      setCurrentRoles(newRoles);
    } else {
      newRoles.splice(newRoles.indexOf(e.target.value), 1);
      setCurrentRoles(newRoles);
    }

    if (gamemodes[0].roles.sort().join() === newRoles.sort().join()) {
      setCurrentGamemode(gamemodes[0]);
    } else {
      setCurrentGamemode(gamemodes[1]);
    }
  }

  return (
    <>
      {formErrors.map((formError) => {
        return (
          <div className="toast">
            <div className="alert alert-error">
              <span>{formError}</span>
            </div>
          </div>
        );
      })}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const response = await fetch(serverUrl + "/lobbies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roles: currentGamemode.roles,
              gamemode: currentGamemode.name,
              hostPlayerName: hostPlayerName,
            }),
          });

          const responseJson = await response.json();

          if (responseJson.status === "success") {
            setLocation(`/servers/${responseJson.id}?name=${hostPlayerName}`);
          } else {
            setFormErrors(responseJson.errors);
          }
        }}
        className="flex flex-col gap-8 items-center py-4 mb-20 w-full"
      >
        <div className="max-h-xl flex justify-center gap-4 p-8 w-full max-w-7xl min-h-screen rounded-lg">
          <div className="flex flex-col gap-4 items-center max-w-3xl">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="roles" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                Village Roles
              </div>
              <div className="collapse-content">
                <div className="grid auto-rows-fr grid-cols-3 gap-4 justify-center items-center p-4">
                  {villageRoles.map((role) => {
                    const isChecked = currentGamemode.roles.includes(role.name);
                    return (
                      <div
                        className={`flex h-full justify-between items-center outline-secondary rounded-lg${
                          !isChecked
                            ? " outline outline-1 outline-secondary opacity-15"
                            : " bg-secondary bg-opacity-15"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="role"
                          id={role.name}
                          value={role.name}
                          defaultChecked={isChecked}
                          onChange={checkCurrentGamemode}
                          className="accent-secondary hidden"
                        />
                        <label
                          htmlFor={role.name}
                          className="flex gap-4 items-center w-full p-2 px-4"
                        >
                          <img
                            src={`/images/roles/${role.img}`}
                            alt={role.name}
                            className="aspect-square object-contain w-8"
                          />
                          <p className="text-start">{role.name}</p>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="roles" />
              <div className="collapse-title text-xl font-medium">
                Werewolf Roles
              </div>
              <div className="collapse-content">
                <div className="grid auto-rows-fr grid-cols-3 gap-4 items-center p-4">
                  {werewolfRoles.map((role) => {
                    const isChecked = currentGamemode.roles.includes(role.name);
                    return (
                      <div
                        className={`flex h-full justify-between items-center outline-secondary rounded-lg${
                          !isChecked
                            ? " outline outline-1 outline-secondary opacity-15"
                            : " bg-secondary bg-opacity-15"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="role"
                          id={role.name}
                          value={role.name}
                          defaultChecked={isChecked}
                          onChange={checkCurrentGamemode}
                          className="accent-secondary hidden"
                        />
                        <label
                          htmlFor={role.name}
                          className="flex gap-4 items-center w-full p-2 px-4"
                        >
                          <img
                            src={`/images/roles/${role.img}`}
                            alt={role.name}
                            className="aspect-square object-contain w-8"
                          />
                          <p className="text-start">{role.name}</p>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="roles" />
              <div className="collapse-title text-xl font-medium">
                Solo Roles
              </div>
              <div className="collapse-content">
                <div className="grid auto-rows-fr grid-cols-3 gap-4 items-center p-4">
                  {soloRoles.map((role) => {
                    const isChecked = currentGamemode.roles.includes(role.name);
                    return (
                      <div
                        className={`flex h-full justify-between items-center outline-secondary rounded-lg${
                          !isChecked
                            ? " outline outline-1 outline-secondary opacity-15"
                            : " bg-secondary bg-opacity-15"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="role"
                          id={role.name}
                          value={role.name}
                          defaultChecked={isChecked}
                          onChange={checkCurrentGamemode}
                          className="accent-secondary hidden"
                        />
                        <label
                          htmlFor={role.name}
                          className="flex gap-4 items-center w-full p-2 px-4"
                        >
                          <img
                            src={`/images/roles/${role.img}`}
                            alt={role.name}
                            className="aspect-square object-contain w-8"
                          />
                          <p className="text-start">{role.name}</p>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 w-1/3 px-10 bg-base-200 py-12 rounded-2xl h-fit">
            <div className="flex flex-col gap-4">
              <div className="w-full text-lg">Gamemode</div>
              <div className="flex flex-wrap gap-3">
                {gamemodes.map((gamemode, index) => {
                  function handleGamemodeChange() {
                    setCurrentGamemode(gamemode);
                  }

                  return (
                    <input
                      type="radio"
                      aria-label={gamemode.name}
                      name="gamemode"
                      value={gamemode.name}
                      className="btn btn-outline btn-sm"
                      key={index}
                      checked={currentGamemode.name === gamemode.name}
                      onChange={handleGamemodeChange}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-full text-lg">Chat</div>
              <div className="flex flex-wrap gap-3 w-full">
                {chats.map((chat, index) => {
                  return (
                    <input
                      type="checkbox"
                      aria-label={chat}
                      name="chat"
                      className="btn btn-outline btn-sm"
                      key={index}
                      value={chat}
                      defaultChecked={chat === "Audio"}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full text-lg">Visibility</div>
              <div className="flex flex-wrap gap-3">
                {visibilityTypes.map((visibility, index) => {
                  return (
                    <input
                      type="radio"
                      aria-label={visibility}
                      name="visibility"
                      className="btn btn-outline btn-sm"
                      key={index}
                      value={visibility}
                      defaultChecked={visibility === "Public"}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full text-lg">Name</div>
              <input
                type="text"
                placeholder="Type here"
                aria-label={hostPlayerName}
                name="hostPlayerName"
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => {
                  setHostPlayerName(e.target.value);
                }}
              />
            </div>

            <button className="btn btn-primary w-full">Submit</button>
          </div>
        </div>
      </form>
    </>
  );
}
