import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation, useParams } from "wouter";
import getTrunucatedString from "../functions/getTrunucatedString";
import getTargetPlayerVoteFromPlayerId from "../functions/getTargetPlayerVoteFromPlayerId.ts"
import getVotesOnPlayerId from "../functions/getVotesOnPlayerId.ts";

export default function ServerId() {
  const [themePreference, setThemePreference] = useState(
    localStorage.getItem("themePreference")
  );

  if (themePreference === null) {
    setThemePreference("Default");
  }

  const [, setPlayerName] = useState("");
  const lobbyId = useParams()["id"];
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [openedDrawer, setOpenedDrawer] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [werewolvesVotes, setWerewolvesVotes] = useState([]);
  const [lynchVotes, setLynchVotes] = useState([]);
  const [, setLocation] = useLocation();
  const [nameInputValue, setNameInputValue] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState({
    id: null,
    name: null,
    isHost: false,
  });

  const nameModal = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    nameModal.current !== null && nameModal.current.showModal();
    const socketUrl = import.meta.env.PROD
      ? "https://werewolf-backend.onrender.com"
      : "http://localhost:10000";
    const socket = io(socketUrl, { port: 10000 });
    setSocket(socket);

    socket.on("connect", () => {
      socket.timeout(5000).emit(
        "lobbyjoin",
        lobbyId,
        "",
        (
          _: never,
          res: {
            isValidId: boolean;
            player: { id: string; name: string; isHost: boolean };
          }
        ) => {
          if (res.isValidId) {
            setCurrentPlayer(res.player);
          } else {
            setLocation("/lobbies?invalidId=true", { replace: true });
          }
        }
      );
    });

    socket.on("playersChanged", (newPlayers) => {
      setPlayers(newPlayers);
    });

    socket.on("phaseChange", (phase) => {
      setCurrentPhase(phase);
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
    });

    socket.on("winner", (newWinner) => {
      setWinner(newWinner);
    });

    socket.on("werewolvesVotesChange", (newWerewolvesVotes) => {
      setWerewolvesVotes(newWerewolvesVotes);
    });

    socket.on("lynchVotesChange", (newLynchVotes) => {
      setLynchVotes(newLynchVotes);
    });

    return () => {
      socket.disconnect();
    };
  }, [lobbyId, setLocation]);

  useEffect(() => {
    localStorage.setItem("themePreference", themePreference);
  }, [themePreference]);

  useEffect(() => {
    const peer = new Peer(currentPlayer.id);

    peer.on("close", () => {
      navigator.mediaDevices.getUserMedia({ audio: false, video: false });
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((localStream) => {
        const videoElement = document.getElementById(
          "video-" + currentPlayer.id
        );

        videoElement.srcObject = localStream;

        peer.on("call", (call) => {
          call.answer(localStream);
          call.on("stream", (stream) => {
            const videoElement2 = document.getElementById("video-" + call.peer);
            videoElement2.srcObject = stream;
          });
        });

        players.forEach((player) => {
          if (
            player.id !== currentPlayer.id &&
            currentPlayer.id &&
            players.length > 1
          ) {
            const call = peer.call(player.id, localStream);

            call.on("stream", (stream) => {
              const videoElement = document.getElementById(
                "video-" + player.id
              );
              videoElement.srcObject = stream;
            });
          }
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  }, [currentPlayer, players]);

  return (
    <>
      <dialog className="modal" ref={nameModal}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">What is your name?</h3>
          <input
            type="text"
            name="nameinput"
            onChange={(e) => {
              setNameInputValue(e.target.value);
            }}
            placeholder="Enter name here"
            className="input input-bordered w-full mt-4"
          />
          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setPlayerName(nameInputValue);
                  socket.emit("nameEnter", nameInputValue);
                }}
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      </dialog>
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
          onChange={() => {setOpenedDrawer(!openedDrawer);}}
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
              {players.map((player) => {
                const isCurrentPlayer =
                  currentPlayer.id && player.id === currentPlayer.id;
                const votesOnPlayer =
                  currentPhase === "Night"
                    ? getVotesOnPlayerId(werewolvesVotes, player.id)
                    : getVotesOnPlayerId(lynchVotes, player.id);

                const playerIsVoting =
                  currentPhase === "Night"
                    ? getTargetPlayerVoteFromPlayerId(
                        werewolvesVotes,
                        player.id
                      )
                    : getTargetPlayerVoteFromPlayerId(lynchVotes, player.id);
                return (
                  <div
                    className="relative flex flex-col w-56 aspect-square rounded-2xl"
                    onClick={() => {
                      socket.emit("playerClicked", currentPlayer.id, player);
                    }}
                  >
                    <p className="btn btn-ghost absolute top-0 right-0 text-lg">
                      {votesOnPlayer > 0 && votesOnPlayer}
                    </p>
                    <video
                      id={"video-" + player.id}
                      autoPlay
                      playsInline
                      controls={false}
                      className="w-full bg-secondary rounded-t-2xl object-fill aspect-video"
                    />
                    {isCurrentPlayer ? (
                      <div className="bg-red-500 h-10 flex justify-between items-center p-3 bg-opacity-30 w-full text-center bottom-0 rounded-b-2xl">
                        <div className="tooltip" data-tip={player.name}>
                          <p className="text-md">
                            {getTrunucatedString(player.name, 18)}
                          </p>
                          <p>{player.status}</p>
                          <p>{player.role}</p>
                          {currentPhase === "Voting" && (
                            <p>
                              Voting: {playerIsVoting && playerIsVoting.name}
                            </p>
                          )}
                        </div>
                        <label className="swap">
                          <input type="checkbox" defaultChecked />

                          <div className="swap-on">{"<"}</div>
                          <div className="swap-off">-</div>
                        </label>
                      </div>
                    ) : (
                      <div className="flex h-10 justify-between items-center p-3 bg-secondary-content bg-opacity-30 w-full text-center bottom-0 rounded-b-2xl">
                        <div className="tooltip" data-tip={player.name}>
                          <p className="text-sm">
                            {getTrunucatedString(player.name, 18)}
                          </p>
                          <p>{player.status}</p>
                          <p>{player.role}</p>
                          {currentPhase === "Voting" && (
                            <p>
                              Voting: {playerIsVoting && playerIsVoting.name}
                            </p>
                          )}
                        </div>
                        <label className="swap">
                          <input type="checkbox" defaultChecked />

                          <div className="swap-on">{"<"}</div>
                          <div className="swap-off">-</div>
                        </label>
                      </div>
                    )}
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
                  <div className="grid grid-cols-5 items-center p-4 outline outline-2 outline-base-300 h-40 gap-x-4 rounded-lg">
                    {/* {roles.map((role) => {
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
                  })} */}
                  </div>
                  <div className="flex flex-col gap-3 p-4 outline outline-base-300 outline-2 rounded-lg">
                    <p className="text-center text-lg">Players</p>
                    {players.map((player) => {
                      if (!gameStarted || player.status === "Alive") {
                        return <p>{player.name}</p>;
                      } else {
                        return (
                          <s className="opacity-15">{player.name} (dead)</s>
                        );
                      }
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
                    <div>Gamemode: Classic</div>
                    <div>Max players: 16</div>
                    <div>Age: 16+</div>
                    <div>Chat: Mic only</div>
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
                      <input
                        type="radio"
                        name="theme-selector"
                        value={
                          !gameStarted
                            ? "default"
                            : currentPhase !== "Night"
                            ? "light"
                            : "dark"
                        }
                        className="btn btn-outline theme-controller"
                        defaultChecked={themePreference === "Default"}
                        onClick={() => setThemePreference("Default")}
                        aria-label="Dynamic"
                      />
                      <input
                        type="radio"
                        name="theme-selector"
                        value="light"
                        className="btn btn-outline theme-controller"
                        defaultChecked={themePreference === "Light"}
                        onClick={() => setThemePreference("Light")}
                        aria-label="Light"
                      />
                      <input
                        type="radio"
                        name="theme-selector"
                        value="dark"
                        className="btn btn-outline theme-controller"
                        defaultChecked={themePreference === "Dark"}
                        onClick={() => setThemePreference("Dark")}
                        aria-label="Dark"
                      />
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
                  <dialog
                    id="my_modal_5"
                    className="modal modal-bottom sm:modal-middle"
                  >
                    <div className="modal-box">
                      <p className="py-4">
                        Are you sure you want to{" "}
                        {currentPlayer && currentPlayer.isHost
                          ? "end"
                          : "leave"}{" "}
                        the game?
                        {currentPlayer &&
                          currentPlayer.isHost &&
                          " This will kick all of the players and delete the lobby."}
                      </p>
                      <div className="modal-action flex flex-2">
                        <form method="dialog">
                          <button className="btn w-16">No</button>
                        </form>
                        <button className="btn btn-error w-16">Yes</button>
                      </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                      <button>close</button>
                    </form>
                  </dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
