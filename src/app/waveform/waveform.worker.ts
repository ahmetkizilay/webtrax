/// <reference lib="webworker" />

import { buildWaveform } from "./waveform";

interface WaveformMessage {
  audioBuffer: ArrayBufferLike;
  waveformBuffer: ArrayBufferLike;
  sampleId: string;
}

addEventListener('message', ({data}) => {
  const { audioBuffer, sampleId } = data as WaveformMessage
  let waveformBuffer = data.waveformBuffer;

  waveformBuffer = buildWaveform(audioBuffer, waveformBuffer);

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
