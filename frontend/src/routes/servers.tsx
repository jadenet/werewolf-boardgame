import { faker } from "@faker-js/faker";
import { Link } from "wouter";

const lobbies: any[] = [];
const gamemodes = ["Classic", "Custom"];
const chats = ["Video", "Audio"];
const ages = ["13+", "16+", "18+"];
const sorts = ["Player count"];

for (let index = 0; index < 16; index++) {
  const maxPlayers = 16;
  const lobby = {
    id: faker.number.int(),
    maxPlayers: maxPlayers,
    playerCount: faker.number.int({ min: 1, max: maxPlayers - 1 }),
    playerHost: faker.internet.userName(),
    gamemode: faker.helpers.arrayElement(gamemodes),
    potentialRoles: [],
    ages: faker.helpers.arrayElement(ages),
    chats: faker.helpers.arrayElements(chats),
    inviteOnly: false,
  };
  lobbies.push(lobby);
}

export default function Servers() {
  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col mx-10 my-6">
        <div className="overflow-x-auto">
          <table className="table table-lg table-zebra">
            <thead>
              <tr>
                <th>Gamemode</th>
                <th>Players</th>
                <th>Chat</th>
                <th>Age</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lobbies.map((lobby: any) => {
                return (
                  <tr className="hover">
                    <td>{lobby.gamemode}</td>
                    <td>
                      {lobby.playerCount} / {lobby.maxPlayers}
                    </td>
                    <td className="max-w-52">
                      <div className="flex flex-wrap gap-4">
                        {lobby.chats.map((tag: any) => {
                          return (
                            <div className="badge badge-lg badge-outline">
                              {tag}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td>{lobby.ages}</td>

                    <td>
                      <Link
                        className="btn btn-outline w-24"
                        href={`/servers/${lobby.id}`}
                      >
                        Join
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <label
          htmlFor="my-drawer-2"
          className="btn btn-primary drawer-button lg:hidden"
        >
          Open drawer
        </label>
      </div>
      <div className="drawer-side h-full bg-base-200">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu p-4 w-80 min-h-[80vh] text-base-content">
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl">Gamemode</div>
            <div className="collapse-content">
              <div className="flex flex-wrap gap-3">
                {gamemodes.map((gamemode, index) => {
                  return (
                    <button className="btn btn-outline btn-xs" key={index}>
                      {gamemode}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl">Max players</div>
            <div className="collapse-content">
              <input
                type="range"
                min={4}
                max="16"
                defaultValue="16"
                className="range"
              />
              <div className="w-full flex justify-between text-xs px-2">
                <span>4</span>
                <span>8</span>
                <span>12</span>
                <span>16</span>
              </div>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl">Chat</div>
            <div className="collapse-content">
              <div className="flex flex-wrap gap-3">
                {chats.map((chat, index) => {
                  return (
                    <button className="btn btn-outline btn-xs" key={index}>
                      {chat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl">Ages</div>
            <div className="collapse-content">
              <div className="flex flex-wrap gap-3">
                {ages.map((age, index) => {
                  return (
                    <>
                      <input
                        type="radio"
                        name="ages"
                        id={age}
                        value={age}
                        className="hidden"
                      />
                      <label
                        htmlFor={age}
                        className="btn btn-outline btn-xs"
                        key={index}
                      >
                        {age}
                      </label>
                    </>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl">Sort</div>
            <div className="collapse-content">
              <div className="flex flex-wrap gap-3">
                {sorts.map((sort, index) => {
                  return (
                    <button className="btn btn-primary btn-xs" key={index}>
                      {sort}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
