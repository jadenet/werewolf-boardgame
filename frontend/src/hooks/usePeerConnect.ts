import Peer from "peerjs";
import { useEffect, useRef } from "react";

export default function usePeerConnect(currentPlayer, players) {
  const peer = useRef<Peer | null>();
  const localStream = useRef<MediaStream>();

  useEffect(() => {
    peer.current = new Peer(currentPlayer.id);

    function removeMedia() {
      if (localStream.current) {
        navigator.mediaDevices.getUserMedia({ audio: false, video: false });
      }
      peer.current.destroy();
    }

    return removeMedia;
  }, [currentPlayer.id]);

  useEffect(() => {
    async function connectMedia() {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (error) {
        /* empty */
      }

      const videoElement = document.getElementById(
        "video-" + currentPlayer.id
      ) as HTMLVideoElement;

      if (localStream && videoElement) {
        videoElement.srcObject = localStream.current;
      }

      peer.current.on("call", (call) => {
        call.answer(localStream.current && localStream.current);
        call.on("stream", (stream) => {
          const videoElement2 = document.getElementById(
            "video-" + call.peer
          ) as HTMLVideoElement;
          videoElement2.srcObject = stream;
        });
      });

      players.forEach((player) => {
        if (
          player.id !== currentPlayer.id &&
          currentPlayer.id &&
          players.length > 1 &&
          localStream
        ) {
          const call = peer.current.call(player.id, localStream.current);

          call.on("stream", (stream) => {
            const videoElement = document.getElementById(
              "video-" + player.id
            ) as HTMLVideoElement;
            videoElement.srcObject = stream;
          });
        }
      });
    }
    connectMedia();
  }, [currentPlayer, players]);
}
