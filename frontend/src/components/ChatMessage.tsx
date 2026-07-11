import { useEffect, useState } from "react";

export default function ChatMessage(props: {
  playerId: string;
  playerName: string;
  message: string;
  onDismiss: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      props.onDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [props]);

  if (!isVisible) return null;

  return (
    <div className="fixed pointer-events-none z-40 animate-fade-in-up">
      <div className="bg-base-100 border border-base-300 rounded-lg p-3 shadow-lg max-w-xs">
        <p className="text-xs font-semibold text-primary mb-1">{props.playerName}</p>
        <p className="text-sm text-base-content break-words">{props.message}</p>
      </div>
    </div>
  );
}
