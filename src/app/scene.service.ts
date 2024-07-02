import { Injectable } from '@angular/core';

enum TrackType {
  SAMPLE,
}

export interface SampleTrackParams {
  sampleId: string;
  gain: number;
  pan: number;
  delaySend: number;
}

function createSampleTrackParams(sampleId: string): SampleTrackParams {
  return {
    sampleId,
    gain: 1,
    pan: 0,
    delaySend: 0,
  };
}

interface TrackStep {
  active: boolean;
}

export interface Track {
  name: string;
  type: TrackType;
  params: SampleTrackParams;
  steps: TrackStep[];
}

export interface Scene {
  name: string;
  bpm: number;
  stepCount: number;
  tracks: Track[];
}

export class SceneManager {
  static createEmptyScene(name: string, bpm: number, stepCount: number): Scene {
    return {
      name,
      bpm,
      stepCount,
      tracks: [],
    };
  }

  static createDefaultScene(): Scene {
    return {
      name: 'Scene 1',
      bpm: DEFAULT_BPM,
      stepCount: DEFAULT_STEP_COUNT,
      tracks: [
        TrackManager.createTrackWithSteps('kick',
          'public/kick.wav', [
          true, false, false, false,
          true, false, false, false,
          true, false, false, false,
          true, false, false, false,
        ]),
        TrackManager.createTrackWithSteps('snare',
          'public/snare.wav', [
          false, false, true, false,
          false, false, true, false,
          false, false, true, false,
          false, false, true, false,
        ]),
        TrackManager.createTrackWithSteps('tom',
          'public/tom.wav', [
          false, false, false, false,
          false, false, false, false,
          false, false, false, false,
          false, false, false, true,
        ]),
        TrackManager.createTrackWithSteps('clap',
          'public/clap.wav', [
          false, false, false, false,
          true, false, false, false,
          false, false, false, false,
          true, false, false, false,
        ]),
        TrackManager.createTrackWithSteps('cowbell',
          'public/cowbell.wav', [
          false, false, false, false,
          false, false, false, true,
          false, false, false, false,
          false, false, false, false,
        ]),
        TrackManager.createTrackWithSteps('closed_hat',
          'public/closed_hat.wav', [
          true, false, true, false,
          true, false, true, false,
          true, false, true, false,
          true, false, true, false,
        ]),
      ],
    };
  }

  static fromScene(scene: Scene): SceneManager {
    return new SceneManager(scene);
  }

  constructor(private scene: Scene) {}

  addTrack(track: Track) {
    this.scene.tracks.push(track);
  }
}

export class TrackManager {
  static createEmptyTrack(name: string, sampleId: string, stepCount: number): Track {
    return {
      name,
      type: TrackType.SAMPLE,
      params: createSampleTrackParams(sampleId),
      steps: Array.from({ length: stepCount }, () => ({ active: false })),
    };
  }

  static createTrackWithSteps(name: string, sampleId: string, steps: boolean[]): Track {
    return {
      name,
      type: TrackType.SAMPLE,
      params: createSampleTrackParams(sampleId),
      steps: steps.map((active) => ({ active })),
    };
  }

  static fromTrack(track: Track): TrackManager {
    return new TrackManager(track);
  }

  constructor(private track: Track) {}
}

const DEFAULT_STEP_COUNT = 16;
const DEFAULT_BPM = 128;
