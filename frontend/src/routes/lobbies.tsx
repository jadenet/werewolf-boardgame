import { useMemo, useState } from "react";
import { Link } from "wouter";

const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://werewolf-backend.onrender.com"
    : "http://localhost:10000";

const sorts = ["Player count"];

export default function Lobbies() {
  const [lobbies, setLobbies] = useState([]);
  const lobbiesMemo = useMemo(async () => {
    const lobbiesResponse = await fetch(serverUrl + "/lobbies", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const lobbiesJson = await lobbiesResponse.json();
    return lobbiesJson;
  }, []);

  lobbiesMemo.then((val) => {
    setLobbies(val);
  });

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col mx-10 my-6">
        <div className="overflow-x-auto">
          <table className="table table-lg table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Players</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lobbies.map((lobby) => {
                return (
                  <tr className="hover">
                    <td>{lobby.name || "Unnamed"}</td>
                    <td>
                      {lobby.players.length} / {lobby.maxPlayers}
                    </td>

                    <td>
                      <Link
                        className="btn btn-outline w-24"
                        href={`/lobbies/${lobby.id}`}
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
