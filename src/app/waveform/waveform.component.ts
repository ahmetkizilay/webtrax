import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../scene.service';
import { SampleLibraryService } from '../sample_library/sample-library.service';

@Component({
  selector: 'app-waveform',
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
  <canvas #canvas width="360" height="136"></canvas>
</div>
  `,
  styleUrls: ['./waveform.component.css']
})
export class WaveformComponent implements AfterViewInit, OnChanges {
  sampleLibrary: SampleLibraryService = inject(SampleLibraryService);

  @Input({ required: true }) track!: Track;

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  // number of strokes to draw to represent the waveform.
  sampleCount = 75;
  // the max height of the strokes to represent max signal amplitude.
  waveformHeight = 120;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['track']) {
      this.renderWaveform();
    }
  }

  ngAfterViewInit() {
    this.renderWaveform();
  }

  private renderWaveform() {
    if (!this.canvas) {
      return;
    }
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // TODO: move this to a web worker. maybe?
    // Step 1: Extract Audio Data
    const audioBuffer = this.sampleLibrary.getSampleBuffer(this.track.params.sampleId);
    const rawData = audioBuffer!.getChannelData(0); // Get data from the first channel
    // blockSize is the number of samples to average in each bucket
    // for now hard-coding 50ms worth of samples per block
    const blockSize = Math.floor(audioBuffer!.sampleRate / 200);
    const canvasMid = canvas.height / 2;
    const xOffset = 12;
    // 75 * 4 + 12 = 312
    const xSeparation = 4;
    const lineWidth = 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(202, 235, 204)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.lineWidth = lineWidth;

    for (let i = 0; i < this.sampleCount; i++) {
      let sum = 0;
      // Keeping an handle on j to get the number of samples in the block.
      // RawData may not be a multiple of blockSize.
      let j = 0;
      let blockOffset = (i * blockSize);
      for (j = 0; j < blockSize; j++) {
        if (blockOffset + j >= rawData.length) {
          break;
        }
        sum += Math.abs(rawData[blockOffset + j]);
      }
      const average = sum / j;
      const height = average * this.waveformHeight; // Normalize height to fit in the canvas

      // Finally drawing the waveform
      const x = xOffset + (i * xSeparation);
      ctx.beginPath();
      ctx.moveTo(x, canvasMid - (height / 2));
      ctx.lineTo(x, canvasMid + (height / 2));
      ctx.stroke();
    }
  }
}
