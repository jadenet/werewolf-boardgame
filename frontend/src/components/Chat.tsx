import { useState } from "react";

export default function Chat(props) {
  const [inputValue, setInputValue] = useState("");

  return (
    <>
      <p className="opacity-40 my-8">
        This is the beginning of the chat. Remember to be respectful and to play
        fairly.
      </p>
      <div className="flex flex-col-reverse gap-3 overflow-y-scroll h-[32rem] mx-2 my-8">
        <div>
          {props.chatMessages.map((chat) => {
            return (
              <div
                className={`chat chat-${
                  chat.playerId === props.currentPlayerId
                    ? "end grid-cols-[auto_2.5rem] "
                    : "start grid-cols-[2.5rem_auto] "
                }`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 bg-primary rounded-full" />
                </div>
                <div className="chat-header">{chat.playerId}</div>
                <div className="chat-bubble w-full">{chat.message}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-4 bg-base-200 h-20 overflow-y-hidden">
        <input
          type="text"
          placeholder="Type a message"
          name="text"
          id="text input"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          className="input input-bordered w-full"
        />
        <button
          type="submit"
          className="btn btn-outline"
          onClick={() => {
            props.onClick(inputValue);
          }}
        >
          Send
        </button>
      </div>
    </>
  );
}
