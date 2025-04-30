import { Player } from "@/Interfaces";
import { useEffect, useRef, useState } from "react";

export default function NameModal(props) { //TODO: this doesn't currently work
  const nameModal = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    nameModal.current !== null && nameModal.current.showModal();
  }, []);

  const [nameInputValue, setNameInputValue] = useState("");

  function emitNameEnter(name: Player["name"]) {
    props.socket.current.emit("nameEnter", name);
  }

  return (
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
                emitNameEnter(nameInputValue);
                nameModal.current.close();
              }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
