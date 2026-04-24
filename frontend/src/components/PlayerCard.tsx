import { Player, Round } from "@/Interfaces";
import getTrunucatedString from "../functions/getTrunucatedString";
import getVotesOnPlayerId from "../functions/getVotesOnPlayerId.ts";
import { useEffect, useRef } from "react";

export default function PlayerCard(props: {
  player: Player;
  key: Player["id"];
  currentPlayer: Player;
  currentPhase: Round["status"];
  lynchVotes: Round["votes"];
  socket: React.MutableRefObject<any>;
  stream: MediaStream;
}) {
  function emitPlayerClicked(player: Player) {
    if (props.currentPhase === "Voting") {
      // Emit vote for this player
      props.socket.current.emit("vote", props.player.id);
    } else {
      // Handle other interactions (abilities, etc.)
      props.socket.current.emit("playerClicked", props.currentPlayer.id, player);
    }
  }

  const isCurrentPlayer = props.currentPlayer.id && props.player.id === props.currentPlayer.id;
  const votesOnPlayer = getVotesOnPlayerId(props.lynchVotes, props.player.id);

  const videoRef = useRef<HTMLVideoElement>();

  useEffect(() => {
    if (!videoRef.current || videoRef.current.srcObject === props.stream) {
      return;
    }

    videoRef.current.srcObject = props.stream;
  }, [props.stream]);

  return (
    <div
      className={`relative flex flex-col w-56 aspect-square rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
        isCurrentPlayer
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-base-300 bg-base-100 hover:border-primary/50 hover:shadow-lg"
      }`}
      onClick={() => emitPlayerClicked(props.player)}
    >
      {/* Vote count badge */}
      {votesOnPlayer > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="badge badge-primary badge-lg shadow-lg animate-pulse">
            {votesOnPlayer}
          </div>
        </div>
      )}

      {/* Video container */}
      <div className="relative w-full h-4/5 rounded-t-2xl overflow-hidden bg-base-200">
        <video
          ref={videoRef}
          id={"video-" + props.player.id}
          autoPlay
          playsInline
          controls={false}
          className="w-full h-full object-cover"
        />

        {/* Overlay for current player indicator */}
        {isCurrentPlayer && (
          <div className="absolute top-2 left-2">
            <div className="badge badge-secondary badge-sm">You</div>
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute bottom-2 right-2">
          <div className={`badge badge-sm ${
            props.currentPhase === "Night" ? "badge-accent" : "badge-primary"
          }`}>
            {props.currentPhase === "Night" ? "🌙" : "☀️"}
          </div>
        </div>
      </div>

      {/* Name container */}
      <div className="h-10 flex justify-center items-center p-3 bg-base-200/80 backdrop-blur-sm w-full text-center bottom-0 rounded-b-2xl">
        <div className="tooltip tooltip-top" data-tip={props.player.name}>
          <p className={`text-center font-medium truncate ${
            isCurrentPlayer ? "text-primary font-semibold" : "text-base-content"
          }`}>
            {getTrunucatedString(props.player.name, 18)}
          </p>
        </div>
      </div>
    </div>
  );
}
