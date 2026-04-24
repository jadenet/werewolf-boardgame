import { Player } from "@/Interfaces";
import { useEffect, useRef, useState } from "react";

export default function NameModal(props: { socket: React.MutableRefObject<any>, onNameEnter: (name: string) => void, socketConnected: boolean }) {
  const nameModal = useRef<HTMLDialogElement | null>(null);
  const [nameInputValue, setNameInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    nameModal.current?.showModal();
  }, []);

  function handleNameEnter(name: Player["name"]) {
    if (name.trim()) {
      setIsSubmitting(true);
      props.onNameEnter(name.trim());
      nameModal.current?.close();
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !isSubmitting) {
      handleNameEnter(nameInputValue);
    }
  }

  return (
    <dialog className="modal modal-bottom sm:modal-middle" ref={nameModal}>
      <div className="modal-box bg-gradient-to-br from-base-100 to-base-200 border border-base-300 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎭</div>
          <h3 className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to One Night Werewolf
          </h3>
          <p className="text-base-content/70">
            Enter your name to join the mystical gathering
          </p>
        </div>

        <div className="form-control w-full mt-6">
          <label className="label">
            <span className="label-text font-medium">Your Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter your mystical name..."
            className="input input-bordered input-primary w-full focus:input-secondary transition-colors"
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
