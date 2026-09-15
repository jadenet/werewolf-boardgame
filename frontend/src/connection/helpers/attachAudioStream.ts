import { Player } from "../../Interfaces";

export function attachAudioStream(playerId: Player["id"], stream: MediaStream) {
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
