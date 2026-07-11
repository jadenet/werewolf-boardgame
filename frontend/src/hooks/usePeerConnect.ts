import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
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
  players: Player[],
  onPlayerTalkingChange?: (playerId: Player["id"], isTalking: boolean) => void
) {
  const peer = useRef<Peer | null>();
  const localStream = useRef<MediaStream>();
  const audioContext = useRef<AudioContext | null>(null);
  const monitorCleanupByPlayer = useRef<Record<string, () => void>>({});
  const talkingStateByPlayer = useRef<Record<string, boolean>>({});
  const [isMicMuted, setIsMicMuted] = useState(false);

  function applyMicMutedState(muted: boolean) {
    localStream.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });

    if (muted) {
      updateTalkingState(currentPlayer.id, false);
    }
  }

  function toggleMicMute() {
    setIsMicMuted((previous) => {
      const nextMuted = !previous;
      applyMicMutedState(nextMuted);
      return nextMuted;
    });
  }

  function updateTalkingState(playerId: Player["id"], isTalking: boolean) {
    if (!onPlayerTalkingChange || talkingStateByPlayer.current[playerId] === isTalking) {
      return;
    }

    talkingStateByPlayer.current[playerId] = isTalking;
    onPlayerTalkingChange(playerId, isTalking);
  }

  function stopTalkingMonitor(playerId: Player["id"]) {
    const cleanup = monitorCleanupByPlayer.current[playerId];
    if (cleanup) {
      cleanup();
      delete monitorCleanupByPlayer.current[playerId];
    }
    updateTalkingState(playerId, false);
  }

  function monitorSpeaking(playerId: Player["id"], stream: MediaStream) {
    if (!stream) {
      return;
    }

    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }

    stopTalkingMonitor(playerId);

    const source = audioContext.current.createMediaStreamSource(stream);
    const analyser = audioContext.current.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const sampleBuffer = new Uint8Array(analyser.frequencyBinCount);
    let speakingFrames = 0;
    let silentFrames = 0;

    const intervalId = window.setInterval(() => {
      analyser.getByteFrequencyData(sampleBuffer);

      let energyTotal = 0;
      for (const value of sampleBuffer) {
        energyTotal += value;
      }

      const averageEnergy = energyTotal / sampleBuffer.length;
      const energyThreshold = 22;

      if (averageEnergy > energyThreshold) {
        speakingFrames += 1;
        silentFrames = 0;
      } else {
        silentFrames += 1;
        speakingFrames = 0;
      }

      if (speakingFrames >= 2) {
        updateTalkingState(playerId, true);
      }

      if (silentFrames >= 6) {
        updateTalkingState(playerId, false);
      }
    }, 120);

    monitorCleanupByPlayer.current[playerId] = () => {
      window.clearInterval(intervalId);
      source.disconnect();
      analyser.disconnect();
    };
  }

  useEffect(() => {
    peer.current = new Peer(currentPlayer.id);

    function removeMedia() {
      Object.keys(monitorCleanupByPlayer.current).forEach((playerId) => {
        stopTalkingMonitor(playerId);
      });

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      if (audioContext.current) {
        void audioContext.current.close();
        audioContext.current = null;
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
      applyMicMutedState(isMicMuted);
      monitorSpeaking(currentPlayer.id, mediaDevices);
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
          monitorSpeaking(call.peer, stream);
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
            monitorSpeaking(player.id, stream);
          });
        }
      });
    }

    getMediaDevices();
  }, [currentPlayer.id, players]);

  return {
    isMicMuted,
    toggleMicMute,
  };

}

// export function callPlayer() {}
