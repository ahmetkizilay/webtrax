import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../scene.service';
import { SampleLibraryService } from '../sample_library/sample_library.service';

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
  private viewInitialized = false;
  private sampleLibrary: SampleLibraryService = inject(SampleLibraryService);
  // number of strokes to draw to represent the waveform.
  private waveformSize = 75;
  private waveformData: Float32Array = new Float32Array(this.waveformSize);
  // the max height of the strokes to represent max signal amplitude.
  waveformHeight = 120;

  @Input({ required: true }) track!: Track;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['track']) {

      if (!this.viewInitialized) {
        return;
      }

      this.requestWaveform();
    }
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.requestWaveform();
  }

  requestWaveform() {
    const waveformData$ = this.sampleLibrary.requestWaveform(this.track.params.sampleId, this.waveformData);
    waveformData$.subscribe((data) => {
      this.waveformData = new Float32Array(data.data);
      this.renderWaveform();
    });
  }

  private renderWaveform() {
    if (!this.canvas) {
      return;
    }
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

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

    for (let i = 0; i < this.waveformData.length; i++) {
      // Normalize height to fit in the canvas
      const height = this.waveformData[i] * this.waveformHeight;

      // Finally drawing the waveform
      const x = xOffset + (i * xSeparation);
      ctx.beginPath();
      ctx.moveTo(x, canvasMid - (height / 2));
      ctx.lineTo(x, canvasMid + (height / 2));
      ctx.stroke();
    }
  }
}
