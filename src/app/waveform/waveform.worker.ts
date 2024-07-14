/// <reference lib="webworker" />

import { buildWaveform } from "./waveform";

interface WaveformMessage {
  audioBuffer: ArrayBufferLike;
  waveformBuffer: ArrayBufferLike;
  blockSize: number;
  sampleId: string;
}

addEventListener('message', ({data}) => {
  const { audioBuffer, sampleId, blockSize } = data as WaveformMessage
  let waveformBuffer = data.waveformBuffer;

  waveformBuffer = buildWaveform(audioBuffer, waveformBuffer, blockSize);

  postMessage(
    {
      status: 'done',
      sampleId,
      waveformBuffer: waveformBuffer,
      audioBuffer: audioBuffer,
    },
    // moving the ownership back...
    [waveformBuffer, audioBuffer]
  );
});
