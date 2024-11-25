import { useLocation } from "wouter";

export default function LeaveModal(props) {
  const [, setLocation] = useLocation();

  function leaveLobby() {
    setLocation("/");
  }

  return (
    <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box">
        <p className="py-4">
          Are you sure you want to{" "}
          {props.currentPlayer && props.currentPlayer.isHost ? "end" : "leave"}{" "}
          the game?
          {props.currentPlayer &&
            props.currentPlayer.isHost &&
            " This will kick all of the players and remove the lobby."}
        </p>
        <div className="modal-action flex flex-2">
          <form method="dialog">
            <button className="btn w-16">No</button>
          </form>
          <button
            className="btn btn-error w-16"
            onClick={() => {
              leaveLobby();
            }}
          >
            Yes
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
