import { buildWaveform } from './waveform';

describe('buildWaveform', () => {
  it('returns the same waveform buffer as the input', () => {
    const audioBuffer = new ArrayBuffer(12);
    const waveformBuffer = new ArrayBuffer(4);
    const result = buildWaveform(audioBuffer, waveformBuffer);
    expect(result).toBe(waveformBuffer);
  });

  it ('calculates averaged sum of audioBuffer', () => {
    const audioBuffer = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
    const waveformBuffer = new Float32Array(4).buffer;
    const result = buildWaveform(audioBuffer, waveformBuffer);
    const resultArray = new Float32Array(result);
    expect(resultArray).toEqual(new Float32Array([1.5, 3.5, 5.5, 7.5]));
  });

  it ('calculates averaged absolute sum of audioBuffer', () => {
    const audioBuffer = new Float32Array([1, -2, 3, -4, 5, -6, 7, -8]).buffer;
    const waveformBuffer = new Float32Array(4).buffer;
    const result = buildWaveform(audioBuffer, waveformBuffer);
    const resultArray = new Float32Array(result);
    expect(resultArray).toEqual(new Float32Array([1.5, 3.5, 5.5, 7.5]));
  });
});
