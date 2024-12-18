import getTrunucatedString from "../functions/getTrunucatedString";
import getTargetPlayerVoteFromPlayerId from "../functions/getTargetPlayerVoteFromPlayerId.ts";
import getVotesOnPlayerId from "../functions/getVotesOnPlayerId.ts";

export default function PlayerCard(props) {
  function emitPlayerClicked(player) {
    props.socket.current.emit("playerClicked", props.currentPlayer.id, player);
  }
  const isCurrentPlayer =
    props.currentPlayer.id && props.player.id === props.currentPlayer.id;
  const votesOnPlayer =
    props.currentPhase === "Night"
      ? getVotesOnPlayerId(props.werewolvesVotes, props.player.id)
      : getVotesOnPlayerId(props.lynchVotes, props.player.id);

  const playerIsVoting =
    props.currentPhase === "Night"
      ? getTargetPlayerVoteFromPlayerId(props.werewolvesVotes, props.player.id)
      : getTargetPlayerVoteFromPlayerId(props.lynchVotes, props.player.id);

  return (
    <div
      className={
        isCurrentPlayer
          ? "relative flex flex-col w-56 aspect-square rounded-2xl border-2 border-base-300 bg-base-300"
          : "relative flex flex-col w-56 aspect-square rounded-2xl border-2 border-base-300 bg-base-200"
      }
      onClick={() => emitPlayerClicked(props.player)}
    >
      <p className="btn btn-ghost absolute top-0 right-0 text-lg">
        {votesOnPlayer > 0 && votesOnPlayer}
      </p>
      <video
        id={"video-" + props.player.id}
        autoPlay
        playsInline
        controls={false}
        className="w-full h-4/5 g-secondary rounded-t-2xl object-cover aspect-video"
      />

      <div className="h-10 flex justify-center items-center p-3 bg-opacity-30 w-full text-center bottom-0 rounded-b-2xl">
        <div className="tooltip" data-tip={props.player.name}>
          <p className={isCurrentPlayer ? "text-md" : "text-sm"}>
            {getTrunucatedString(props.player.name, 18)}
          </p>
        </div>
      </div>
    </div>
  );
}
