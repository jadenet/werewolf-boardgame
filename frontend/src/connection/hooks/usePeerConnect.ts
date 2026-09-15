import Peer from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Player } from "../../Interfaces";
import { attachAudioStream } from "../helpers/attachAudioStream";
import { startSpeakingMonitor } from "../helpers/speakingMonitor";

export default function usePeerConnect(
  currentPlayer: Player,
  players: Player[],
  onPlayerTalkingChange?: (playerId: Player["id"], isTalking: boolean) => void,
) {
  const peer = useRef<Peer | null>();
  const localStream = useRef<MediaStream>();
  const audioContext = useRef<AudioContext | null>(null);
  const monitorCleanupByPlayer = useRef<Record<string, () => void>>({});
  const talkingStateByPlayer = useRef<Record<string, boolean>>({});
  const [isMicMuted, setIsMicMuted] = useState(false);

  const updateTalkingState = useCallback(
    (playerId: Player["id"], isTalking: boolean) => {
      if (
        !onPlayerTalkingChange ||
        talkingStateByPlayer.current[playerId] === isTalking
      ) {
        return;
      }

      talkingStateByPlayer.current[playerId] = isTalking;
      onPlayerTalkingChange(playerId, isTalking);
    },
    [onPlayerTalkingChange],
  );

  const applyMicMutedState = useCallback(
    (muted: boolean) => {
    localStream.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });

    if (muted) {
      updateTalkingState(currentPlayer.id, false);
    }
    },
    [currentPlayer.id, updateTalkingState],
  );

  function toggleMicMute() {
    setIsMicMuted((previous) => {
      const nextMuted = !previous;
      applyMicMutedState(nextMuted);
      return nextMuted;
    });
  }

  const stopTalkingMonitor = useCallback((playerId: Player["id"]) => {
    const cleanup = monitorCleanupByPlayer.current[playerId];
    if (cleanup) {
      cleanup();
      delete monitorCleanupByPlayer.current[playerId];
    }
    updateTalkingState(playerId, false);
  }, [updateTalkingState]);

  const monitorSpeaking = useCallback((playerId: Player["id"], stream: MediaStream) => {
    if (!stream) {
      return;
    }

    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }

    stopTalkingMonitor(playerId);

    monitorCleanupByPlayer.current[playerId] = startSpeakingMonitor(
      audioContext.current,
      stream,
      (isSpeaking) => updateTalkingState(playerId, isSpeaking),
    );
  }, [stopTalkingMonitor, updateTalkingState]);

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
  }, [currentPlayer.id, stopTalkingMonitor]);

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
  }, [applyMicMutedState, currentPlayer.id, isMicMuted, monitorSpeaking, players]);

  return {
    isMicMuted,
    toggleMicMute,
  };
}
