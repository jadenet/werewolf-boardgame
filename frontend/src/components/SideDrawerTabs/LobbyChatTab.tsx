import { Round } from "../../Interfaces";

type LobbyFeedMessage = {
  id: string;
  kind: "player" | "system";
  playerName: string;
  message: string;
  timestamp: number;
};

export default function LobbyChatTab(props: {
  messages: LobbyFeedMessage[];
  currentPhase: Round["status"];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
}) {
  const canChat = props.currentPhase !== "Night";

  return (
    <div className="flex h-[80vh] min-h-0 flex-col gap-4 px-2 py-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100/50 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-base-300/70 px-4 py-3">
          <div>
            <h3 className="text-lg font-bold text-base-content">Lobby Chat</h3>
            <p className="text-xs text-base-content/70">
              Player messages and lobby notifications stay here.
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-scroll px-3 py-4">
          {props.messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-base-300 bg-base-200/40 px-4 py-5 text-sm text-base-content/60">
              No messages yet. Lobby notifications and chat messages will appear here.
            </div>
          ) : (
            props.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border px-4 py-3 shadow-sm transition-colors ${
                  msg.kind === "system"
                    ? "border-info/30 bg-info/10"
                    : "border-base-300 bg-base-100"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      msg.kind === "system" ? "text-info" : "text-primary"
                    }`}
                  >
                    {msg.kind === "system" ? "Lobby" : msg.playerName}
                  </p>
                  <span className="text-[11px] text-base-content/50">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="break-words text-sm text-base-content">{msg.message}</p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-base-300/70 px-3 py-3">
          {canChat ? (
            <div className="join w-full">
              <input
                type="text"
                placeholder="Send a message to the lobby..."
                value={props.chatInput}
                onChange={(e) => props.onChatInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    props.onSendMessage();
                  }
                }}
                className="input input-bordered join-item w-full text-sm"
              />
              <button onClick={props.onSendMessage} className="btn btn-primary join-item">
                Send
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-base-content/80">
              Chat is disabled during the night phase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
