const SPEAKING_ENERGY_THRESHOLD = 22;
const SPEAKING_FRAMES_TO_START = 2;
const SILENT_FRAMES_TO_STOP = 6;
const ANALYSIS_INTERVAL_MS = 120;

function getAverageEnergy(sampleBuffer: Uint8Array) {
  let energyTotal = 0;
  for (const value of sampleBuffer) {
    energyTotal += value;
  }
  return energyTotal / sampleBuffer.length;
}

// Watches an audio stream's energy level and reports speaking start/stop transitions.
export function startSpeakingMonitor(
  audioContext: AudioContext,
  stream: MediaStream,
  onSpeakingChange: (isSpeaking: boolean) => void
) {
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const sampleBuffer = new Uint8Array(analyser.frequencyBinCount);
  let speakingFrames = 0;
  let silentFrames = 0;

  const intervalId = window.setInterval(() => {
    analyser.getByteFrequencyData(sampleBuffer);
    const averageEnergy = getAverageEnergy(sampleBuffer);

    if (averageEnergy > SPEAKING_ENERGY_THRESHOLD) {
      speakingFrames += 1;
      silentFrames = 0;
    } else {
      silentFrames += 1;
      speakingFrames = 0;
    }

    if (speakingFrames >= SPEAKING_FRAMES_TO_START) {
      onSpeakingChange(true);
    }

    if (silentFrames >= SILENT_FRAMES_TO_STOP) {
      onSpeakingChange(false);
    }
  }, ANALYSIS_INTERVAL_MS);

  return () => {
    window.clearInterval(intervalId);
    source.disconnect();
    analyser.disconnect();
  };
}
