"use client";

import { useState } from "react";
import roles from "../../public/roles.json";

const chats = ["Video", "Audio", "Text"];
const languages = ["English", "Dutch", "Spanish"];

let gamemodes = [
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
  }
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

  function checkCurrentGamemode(e) {
    let newRoles = [...currentRoles];
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
      <form
        method="POST"
        className="flex flex-col gap-8 items-center py-4 mb-20 w-full"
      >
        <div className="max-h-xl outline outline-2 outline-base-300 flex gap-4 justify-around items-center p-8 w-full max-w-7xl h-full rounded-lg">
          <div className="flex flex-col gap-8 w-1/3 px-10">
            <div className="flex flex-col flex-1 gap-4 items-center">
              <div className="w-full text-lg text-center">Gamemode</div>
              <div className="flex flex-wrap gap-3 justify-center">
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
                      className="btn btn-outline"
                      key={index}
                      checked={currentGamemode.name === gamemode.name}
                      onChange={handleGamemodeChange}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col flex-1 gap-4 items-center">
              <div className="w-full text-lg text-center">Chat</div>
              <div className="flex flex-wrap gap-3 justify-center w-full">
                {chats.map((chat, index) => {
                  return (
                    <input
                      type="checkbox"
                      aria-label={chat}
                      name="chat"
                      className="btn btn-outline"
                      key={index}
                      value={chat}
                      defaultChecked={chat === "Audio" || chat === "Text"}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col flex-1 gap-4 items-center">
              <div className="w-full text-lg text-center">Languages</div>
              <div className="flex flex-wrap gap-3 justify-center">
                {languages.map((language, index) => {
                  return (
                    <input
                      type="checkbox"
                      aria-label={language}
                      name="language"
                      className="btn btn-outline"
                      key={index}
                      value={language}
                      defaultChecked={language === "English"}
                    />
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Submit
            </button>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="roles" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                Village Roles
              </div>
              <div className="collapse-content">
                <div className="grid grid-cols-4 gap-4 items-center p-4">
                  {villageRoles.map((role) => {
                    return (
                      <>
                        <input
                          type="checkbox"
                          name="role"
                          id={role.name}
                          value={role.name}
                          defaultChecked={currentGamemode.roles.includes(role.name)}
                          onChange={checkCurrentGamemode}
                        />
                        <label
                          htmlFor={role.name}
                          className="tooltip flex gap-4 items-center"
                          data-tip={role.name}
                        >
                          <img
                            src={`/Role_Images/${role.img}`}
                            alt={role.name}
                            className="aspect-square object-contain w-10"
                          />
                          {role.name}
                        </label>
                      </>
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
                <div className="grid grid-cols-4 gap-4 items-center p-4">
                  {werewolfRoles.map((role) => {
                    return (
                      <>
                        <input
                          type="checkbox"
                          name="role"
                          id={role.name}
                          value={role.name}
                          defaultChecked={currentGamemode.roles.includes(
                            role.name
                          )}
                          onChange={checkCurrentGamemode}
                        />
                        <label
                          htmlFor={role.name}
                          className="tooltip flex gap-4 items-center"
                          data-tip={role.name}
                        >
                          <img
                            src={`/Role_Images/${role.img}`}
                            alt={role.name}
                            className="aspect-square object-contain w-10"
                          />
                          {role.name}
                        </label>
                      </>
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
                <div className="grid grid-cols-4 gap-4 items-center p-4">
                  {soloRoles.map((role) => {
                    return (
                      <>
                        <input
                          type="checkbox"
                          name="role"
                          id={role.name}
                          value={role.name}
                          defaultChecked={currentGamemode.roles.includes(
                            role.name
                          )}
                          onChange={checkCurrentGamemode}
                        />
                        <label
                          htmlFor={role.name}
                          className="tooltip flex gap-4 items-center"
                          data-tip={role.name}
                        >
                          <img
                            src={`/Role_Images/${role.img}`}
                            alt={role.name}
                            className="aspect-square object-contain w-10"
                          />
                          {role.name}
                        </label>
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
