"use client";

import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getRoleNames, getRolesFromTeam } from "../functions/getRolesFromTeam";

const chats = ["Audio", "Video"];
const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://werewolf-backend.onrender.com"
    : "http://localhost:10000";

const gamemodes = [
  {
    name: "Classic",
    role_percentages: { werewolves: 5, solos: 5, villagers: 90 },
    roles: getRoleNames(),
  },
  {
    name: "Custom",
    role_percentages: { werewolves: 5, solos: 5, villagers: 90 },
    roles: [],
  },
];

const roleTeams = [
  { name: "Village", roles: getRolesFromTeam("Village") },
  { name: "Werewolf", roles: getRolesFromTeam("Werewolves") },
  { name: "Solo", roles: getRolesFromTeam("Solo") },
]

export default function CreateLobby() {
  const [currentGamemode, setCurrentGamemode] = useState(gamemodes[0]);
  const [currentRoles, setCurrentRoles] = useState(gamemodes[0].roles);
  const [formErrors, setFormErrors] = useState([]);
  const [, setLocation] = useLocation();
  const customGamemode = useMemo(() => currentRoles, [currentRoles]);
  gamemodes[1].roles = customGamemode;

  function checkCurrentGamemode(e) {
    const newRoles = [...currentRoles];
    if (e.target.checked) {
      newRoles.push(e.target.value);
    } else {
      newRoles.splice(newRoles.indexOf(e.target.value), 1);
    }
    setCurrentRoles(newRoles);

    if (gamemodes[0].roles.sort().join() === newRoles.sort().join()) {
      setCurrentGamemode(gamemodes[0]);
    } else {
      setCurrentGamemode(gamemodes[1]);
    }
  }

  return (
    <>
      {formErrors.map((formError, i) => {
        return (
          <div key={i} className="toast">
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
            }),
          });

          const responseJson = await response.json();

          if (responseJson.status === "success") {
            setLocation(`/lobbies/${responseJson.id}`);
          } else {
            setFormErrors(responseJson.errors);
          }
        }}
        className="flex flex-col gap-8 items-center py-4 mb-20 w-full"
      >
        <div className="max-h-xl flex justify-center gap-4 p-8 w-full max-w-7xl min-h-screen rounded-lg">
          <div className="flex flex-col gap-4 items-center max-w-3xl">
          {roleTeams.map((roleTeam) => {
            return (
                <div className="collapse collapse-arrow bg-base-200">
                  <input type="radio" name="roles" defaultChecked={roleTeam.name == "Village"} />
                  <div className="collapse-title text-xl font-medium">
                    {roleTeam.name} Roles
                  </div>
                  <div className="collapse-content">
                    <div className="grid auto-rows-fr grid-cols-3 gap-4 justify-center items-center p-4">
                      {roleTeam.roles.map((role, i) => {
                        const isChecked = currentGamemode.roles.includes(
                          role.name
                        );
                        return (
                          <div
                            key={i}
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
            );
          })}
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

            <button className="btn btn-primary w-full">Submit</button>
          </div>
        </div>
      </form>
    </>
  );
}
