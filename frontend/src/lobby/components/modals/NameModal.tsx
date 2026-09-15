import { Socket } from "socket.io-client";
import { Player } from "../../../Interfaces";
import { useEffect, useRef, useState } from "react";

export default function NameModal(props: { socket: React.MutableRefObject<Socket>, onNameEnter: (name: string) => Promise<boolean> | boolean, socketConnected: boolean }) {
  const nameModal = useRef<HTMLDialogElement | null>(null);
  const [nameInputValue, setNameInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    nameModal.current?.showModal();
  }, []);

  async function handleNameEnter(name: Player["name"]) {
    if (name.trim()) {
      setIsSubmitting(true);
      const didJoinLobby = await props.onNameEnter(name.trim());
      if (didJoinLobby) {
        nameModal.current?.close();
        return;
      }

      setIsSubmitting(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !isSubmitting) {
      handleNameEnter(nameInputValue);
    }
  }

  return (
    <dialog className="modal modal-bottom sm:modal-middle" ref={nameModal}>
      <div className="modal-box bg-base-100 border border-base-300">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎭</div>
          <h3 className="font-bold text-2xl text-primary">
            Welcome to One Night Werewolf
          </h3>
          <p className="text-base-content/70">
            Enter your name to join the gathering
          </p>
        </div>

        <div className="form-control w-full mt-6">
          <label className="label">
            <span className="label-text font-medium">Your Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter your name..."
            className="input input-bordered input-primary w-full focus:input-secondary"
            onChange={(e) => setNameInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting || !props.socketConnected}
            autoFocus
          />
          {!props.socketConnected && (
            <label className="label">
              <span className="label-text-alt text-warning">Connecting to server...</span>
            </label>
          )}
        </div>

        <div className="modal-action justify-center">
          <button
            className={`btn btn-primary btn-lg px-8 ${isSubmitting ? "loading" : ""}`}
            onClick={() => handleNameEnter(nameInputValue)}
            disabled={!nameInputValue.trim() || isSubmitting || !props.socketConnected}
          >
            {isSubmitting ? "Joining..." : !props.socketConnected ? "Connecting..." : "Enter the Circle"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
