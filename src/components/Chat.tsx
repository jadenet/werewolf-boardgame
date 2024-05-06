import { faker } from "@faker-js/faker";

let chats: any[] = [];

for (let index = 0; index < 10; index++) {
  chats.push({
    playerId: faker.internet.userName(),
    message: faker.lorem.sentence(),
    date: faker.date.recent(),
  });
}

const currentPlayerId = 5;

export default function Chat() {
  return (
    <>

      <div className="flex flex-col-reverse gap-3 overflow-y-scroll max-h-[36rem] mx-2 my-8">
        <div>

        <p className="opacity-40">This is the beginning of the chat. Remember to be respectful and to play fairly.</p>
        {chats.map((chat) => {
          return (
            <div
              className={`chat grid-cols-[2.5rem_auto] chat-${
                chat.playerId === currentPlayerId ? "end" : "start"
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
