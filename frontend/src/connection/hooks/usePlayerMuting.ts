import { useEffect, useState } from "react";
import { Player } from "../../Interfaces";

// Tracks per-player mute state/volume and keeps each player's <audio> element in sync with it.
export default function usePlayerMuting(
  players: Player[],
  currentPlayerId: Player["id"] | null,
  isMicMuted: boolean,
  toggleMicMute: () => void
) {
  const [mutedPlayerIds, setMutedPlayerIds] = useState<Record<string, boolean>>({});
  const [playerVolumes, setPlayerVolumes] = useState<Record<string, number>>({});

  const handleTogglePlayerMute = (playerId: Player["id"]) => {
    if (playerId === currentPlayerId) {
      toggleMicMute();
      return;
    }

    setMutedPlayerIds((previous) => {
      const nextMuted = !previous[playerId];

      const audioElement = document.getElementById(`audio-${playerId}`) as HTMLAudioElement | null;
      if (audioElement) {
        audioElement.muted = nextMuted;
      }

      return {
        ...previous,
        [playerId]: nextMuted,
      };
    });
  };

  const handleVolumeChange = (playerId: Player["id"], volume: number) => {
    const clampedVolume = Math.min(1, Math.max(0, volume));

    setPlayerVolumes((previous) => ({
      ...previous,
      [playerId]: clampedVolume,
    }));

    const audioElement = document.getElementById(`audio-${playerId}`) as HTMLAudioElement | null;
    if (audioElement) {
      audioElement.volume = clampedVolume;
    }
  };

  useEffect(() => {
    Object.entries(mutedPlayerIds).forEach(([playerId, isMuted]) => {
      const audioElement = document.getElementById(`audio-${playerId}`) as HTMLAudioElement | null;
      if (audioElement) {
        audioElement.muted = isMuted;
      }
    });
  }, [mutedPlayerIds, players]);

  useEffect(() => {
    Object.entries(playerVolumes).forEach(([playerId, volume]) => {
      const audioElement = document.getElementById(`audio-${playerId}`) as HTMLAudioElement | null;
      if (audioElement) {
        audioElement.volume = volume;
      }
    });
  }, [playerVolumes, players]);

  const isPlayerMuted = (playerId: Player["id"]) =>
    playerId === currentPlayerId ? isMicMuted : Boolean(mutedPlayerIds[playerId]);

  const getPlayerVolume = (playerId: Player["id"]) => playerVolumes[playerId] ?? 1;

  return { isPlayerMuted, handleTogglePlayerMute, getPlayerVolume, handleVolumeChange };
}

