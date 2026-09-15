import { useState } from "react";

export default function AddPlayerCard(props: {
  isHost: boolean;
  onAddBot: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col w-56 aspect-square rounded-2xl border-2 border-dashed border-base-300 bg-base-100/40 items-center justify-center gap-3 p-4">
      <span className="text-4xl">➕</span>
      <p className="text-sm text-base-content/60 text-center">Invite more players</p>
      <button className="btn btn-outline btn-sm w-full" onClick={handleShareLink}>
        {copied ? "Link Copied!" : "Share Link"}
      </button>
      {props.isHost && (
        <button className="btn btn-outline btn-sm w-full" onClick={props.onAddBot}>
          Add Bot
        </button>
      )}
    </div>
  );
}
