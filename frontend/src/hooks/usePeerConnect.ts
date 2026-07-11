import Peer from "peerjs";
import { useEffect, useRef } from "react";
import { Player } from "../Interfaces";

function attachAudioStream(playerId: Player["id"], stream: MediaStream) {
  const audioElement = document.getElementById(
    "audio-" + playerId
  ) as HTMLAudioElement | null;

  if (stream && audioElement && audioElement.srcObject !== stream) {
    audioElement.srcObject = stream;
    void audioElement.play().catch(() => {
      // Autoplay may be blocked until the user interacts with the page.
    });
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
      peer.current?.destroy();
    }

    return removeMedia;
  }, [currentPlayer.id]);

  useEffect(() => {
    async function getMediaDevices() {
      let mediaDevices = null;
      for (let i = 0; i < 5; i++) {
        try {
          mediaDevices = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
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
        mediaDevices = new MediaStream();
      }

      localStream.current = mediaDevices;
      waitForCalls();
      callEachPlayer();
    }

    function waitForCalls() {
      if (!peer.current) {
        return;
      }

      peer.current.on("call", (call) => {
        call.answer(localStream.current ?? new MediaStream());
        call.on("stream", (stream) => {
          attachAudioStream(call.peer, stream);
        });
      });
    }

    function callEachPlayer() {
      if (!peer.current || !localStream.current) {
        return;
      }

      players.forEach((player) => {
        if (
          player.id !== currentPlayer.id &&
          currentPlayer.id &&
          players.length > 1
        ) {
          const call = peer.current.call(player.id, localStream.current);
          call.on("stream", (stream) => {
            attachAudioStream(player.id, stream);
          });
        }
      });
    }

    getMediaDevices();
  }, [currentPlayer.id, players]);

}

// export function callPlayer() {}
