export function buildWaveform(audioBuffer: ArrayBufferLike, waveformBuffer: ArrayBufferLike, blockSize: number): ArrayBufferLike {

  // Convert the transferred ArrayBuffer back to Float32Array
  const raw = new Float32Array(audioBuffer);
  const waveform = new Float32Array(waveformBuffer);

  for (let i = 0; i < waveform.length; i++) {
    let sum = 0;
    // Keeping an handle on j to get the number of samples in the block.
    // RawData may not be a multiple of blockSize.
    let j = 0;
    let blockOffset = i * blockSize;
    for (j = 0; j < blockSize; j++) {
      if (blockOffset + j >= raw.length) {
        break;
      }
      sum += Math.abs(raw[blockOffset + j]);
    }
    waveform[i] = (j === 0) ? 0 : sum / j;
  }

  return waveformBuffer;
}
