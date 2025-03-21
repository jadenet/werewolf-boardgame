import Peer from "peerjs";
import { useEffect, useRef } from "react";
import { Player } from "@/Interfaces";

function displayMedia(playerId: Player["id"], stream: MediaStream) {
  const videoElement = document.getElementById(
    "video-" + playerId
  ) as HTMLVideoElement;
  if (stream && videoElement) {
    videoElement.srcObject = stream;
    console.log("yes", videoElement.srcObject)
  }
}

export default function usePeerConnect(
  currentPlayer: Player,
  players: Player[]
) {
  const peer = useRef<Peer | null>();
  const localStream = useRef<MediaStream>();

  useEffect(() => {
    peer.current = new Peer(currentPlayer.id);

    function removeMedia() {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
      peer.current.destroy();
    }

    return removeMedia;
  }, [currentPlayer.id]);

  useEffect(() => {
    async function getMediaDevices() {
      let mediaDevices = null;
      for (let i = 0; i < 5; i++) {
        try {
          mediaDevices = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          break;
        } catch (error) {
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, 3000);
          });
        }
      }
      if (!mediaDevices) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(new MediaStreamTrack());
        mediaDevices = mediaStream;
      }

      displayMedia(currentPlayer.id, mediaDevices);
    }

    function waitForCalls() {
      peer.current.on("call", (call) => {
        call.answer(localStream.current);
        call.on("stream", (stream) => {
          displayMedia(call.peer, stream);
        });
      });
    }

    getMediaDevices()
    waitForCalls()

    function callEachPlayer() {
      players.forEach((player) => {
        if (
          player.id !== currentPlayer.id &&
          currentPlayer.id &&
          players.length > 1 &&
          localStream.current
        ) {
          const call = peer.current.call(player.id, localStream.current);
          call.on("stream", (stream) => {
            displayMedia(player.id, stream);
          });
        }
      });
    }
    callEachPlayer()
  }, [currentPlayer.id, players]);

}

// export function callPlayer() {}
