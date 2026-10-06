import { startSpeakingMonitor } from "./speakingMonitor";

describe("startSpeakingMonitor", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("reports speaking and silence transitions once and disconnects on cleanup", () => {
    jest.useFakeTimers();
    let energy = 40;
    const analyser = {
      fftSize: 0,
      frequencyBinCount: 4,
      getByteFrequencyData: jest.fn((buffer: Uint8Array) => buffer.fill(energy)),
      disconnect: jest.fn(),
    };
    const source = { connect: jest.fn(), disconnect: jest.fn() };
    const audioContext = {
      createMediaStreamSource: jest.fn(() => source),
      createAnalyser: jest.fn(() => analyser),
    } as unknown as AudioContext;
    const onSpeakingChange = jest.fn();

    const stop = startSpeakingMonitor(audioContext, {} as MediaStream, onSpeakingChange);
    jest.advanceTimersByTime(240);
    energy = 0;
    jest.advanceTimersByTime(720);
    jest.advanceTimersByTime(480);

    expect(onSpeakingChange.mock.calls).toEqual([[true], [false]]);
    expect(analyser.fftSize).toBe(512);
    expect(source.connect).toHaveBeenCalledWith(analyser);

    stop();
    expect(source.disconnect).toHaveBeenCalledTimes(1);
    expect(analyser.disconnect).toHaveBeenCalledTimes(1);
  });
});