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