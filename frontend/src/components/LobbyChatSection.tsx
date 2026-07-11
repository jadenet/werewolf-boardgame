type LobbyChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
};

export default function LobbyChatSection(props: {
  chatMessages: LobbyChatMessage[];
  currentPhase: string | null;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
}) {
  return (
    <>
      <div className="fixed bottom-32 left-4 right-4 flex flex-col gap-3 pointer-events-none z-40 max-h-48 overflow-y-auto">
        {props.chatMessages.map((msg) => (
          <div
            key={msg.id}
            className="bg-base-100 border border-base-300 rounded-lg p-3 shadow-lg max-w-xs pointer-events-auto opacity-90 hover:opacity-100 transition-opacity"
          >
            <p className="text-xs font-semibold text-primary mb-1">{msg.playerName}</p>
            <p className="text-sm text-base-content break-words">{msg.message}</p>
          </div>
        ))}
      </div>

      {props.currentPhase === "Discussion" && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-96 max-w-[90vw] z-30">
          <div className="join w-full">
            <input
              type="text"
              placeholder="Say something during discussion..."
              value={props.chatInput}
              onChange={(e) => props.onChatInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  props.onSendMessage();
                }
              }}
              className="input input-bordered join-item w-full text-sm"
            />
            <button
              onClick={props.onSendMessage}
              className="btn btn-primary join-item"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}