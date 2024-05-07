export default function Chat(props) {
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
                className={`chat grid-cols-[2.5rem_auto] chat-${
                  chat.playerId === props.currentPlayerId ? "end" : "start"
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
          className="input input-bordered w-full"
        />
        <button className="btn btn-outline">Send</button>
      </div>
    </>
  );
}
