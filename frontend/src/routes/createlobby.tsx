"use client";

import { useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { getRoleNames, getRolesFromTeam } from "../functions/getRolesFromTeam";
import { Role } from "@/Interfaces";

const chats = ["Audio", "Video"];
const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://werewolf-backend.onrender.com"
    : "http://localhost:10000";

export default function CreateLobby() {
  const gamemodes = useRef<{
    name: string;
    role_percentages: {
      werewolves: number;
      solos: number;
      villagers: number;
    };
    roles: string[];
  }[]>([]);
  const roleTeams = useRef<{name: string, roles: Role[]}[]>([])

  async function getInfo() {
    gamemodes.current = [
      {
        name: "Classic",
        role_percentages: { werewolves: 5, solos: 5, villagers: 90 },
        roles: await getRoleNames(),
      },
      {
        name: "Custom",
        role_percentages: { werewolves: 5, solos: 5, villagers: 90 },
        roles: [],
      },
    ];

    roleTeams.current = [
      { name: "Village", roles: await getRolesFromTeam("Village") },
      { name: "Werewolf", roles: await getRolesFromTeam("Werewolves") },
      { name: "Solo", roles: await getRolesFromTeam("Solo") },
    ];
  }

  getInfo()

  const [currentGamemode, setCurrentGamemode] = useState(gamemodes.current[0]);
  const [currentRoles, setCurrentRoles] = useState(gamemodes.current[0]?.roles || []);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const customGamemode = useMemo(() => currentRoles, [currentRoles]);
  gamemodes.current[1].roles = customGamemode;

  function checkCurrentGamemode(e: React.ChangeEvent<HTMLInputElement>) {
    const newRoles = [...currentRoles];
    if (e.target.checked) {
      newRoles.push(e.target.value);
    } else {
      newRoles.splice(newRoles.indexOf(e.target.value), 1);
    }
    setCurrentRoles(newRoles);

    if (gamemodes.current[0]?.roles.sort().join() === newRoles.sort().join()) {
      setCurrentGamemode(gamemodes.current[0]);
    } else {
      setCurrentGamemode(gamemodes.current[1]);
    }
  }

  return (
    <div className="min-h-[84vh] p-4">
      {formErrors.map((formError, i) => {
        return (
          <div key={i} className="toast toast-top toast-center">
            <div className="alert alert-error shadow-lg">
              <span>{formError}</span>
            </div>
          </div>
        );
      })}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setFormErrors([]);
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
            setFormErrors(responseJson.errors || ["An error occurred"]);
          }
        }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create Your Lobby
          </h1>
          <p className="text-lg text-base-content/70">
            Customize your game settings and select the roles for an unforgettable experience
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-semibold text-center">Select Roles</h2>
            {roleTeams.current.map((roleTeam) => {
              return (
                <div key={roleTeam.name} className="collapse collapse-arrow bg-base-200/50 backdrop-blur-sm border border-base-300 rounded-xl shadow-lg">
                  <input
                    type="radio"
                    name="roles"
                    defaultChecked={roleTeam.name == "Village"}
                  />
                  <div className="collapse-title text-xl font-medium">
                    {roleTeam.name} Roles
                  </div>
                  <div className="collapse-content">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center items-center p-4">
                      {roleTeam.roles.map((role, i) => {
                        const isChecked = currentGamemode.roles.includes(
                          role.name
                        );
                        return (
                          <div
                            key={i}
                            className={`card bg-base-100 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                              !isChecked
                                ? "outline outline-1 outline-base-300 opacity-60 hover:opacity-80"
                                : "outline outline-2 outline-primary bg-primary/5 shadow-primary/20"
                            } rounded-lg`}
                          >
                            <input
                              type="checkbox"
                              name="role"
                              id={role.name}
                              value={role.name}
                              defaultChecked={isChecked}
                              onChange={checkCurrentGamemode}
                              className="hidden"
                            />
                            <label
                              htmlFor={role.name}
                              className="flex gap-3 items-center w-full p-3 cursor-pointer"
                            >
                              <img
                                src={`/images/roles/${role.image}`}
                                alt={role.name}
                                className="aspect-square object-contain w-10 h-10 rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{role.name}</p>
                                <p className="text-xs text-base-content/60 line-clamp-2">{role.description}</p>
                              </div>
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

          <div className="lg:w-80 space-y-6">
            <div className="bg-base-200/50 backdrop-blur-sm border border-base-300 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-center">Game Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Gamemode</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {gamemodes.current.map((gamemode, index) => {
                      function handleGamemodeChange() {
                        setCurrentGamemode(gamemode);
                        setCurrentRoles(gamemode.roles);
                      }

                      return (
                        <input
                          type="radio"
                          aria-label={gamemode.name}
                          name="gamemode"
                          value={gamemode.name}
                          className="btn btn-outline btn-sm flex-1"
                          key={index}
                          checked={currentGamemode?.name === gamemode.name}
                          onChange={handleGamemodeChange}
                        />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Chat Options</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {chats.map((chat, index) => {
                      return (
                        <input
                          type="checkbox"
                          aria-label={chat}
                          name="chat"
                          className="btn btn-outline btn-sm flex-1"
                          key={index}
                          value={chat}
                          defaultChecked={chat === "Audio"}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4">
                  <button className="btn btn-primary w-full btn-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    🎮 Create Lobby
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-base-200/50 backdrop-blur-sm border border-base-300 rounded-xl p-6 shadow-lg">
              <h4 className="font-semibold mb-3">Selected Roles ({currentRoles.length})</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {currentRoles.map((role, index) => (
                  <div key={index} className="text-sm text-base-content/70 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}