import { Injectable } from '@angular/core';

enum TrackType {
  SAMPLE,
}

interface SampleTrackParams {
  sampleId: string;
  gain?: number;
  pan?: number;
  delaySend?: number;
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
        TrackManager.createTrackWithSteps('kick', [
          true, false, false, false,
          true, false, false, false,
          true, false, false, false,
          true, false, false, false,
        ]),
        TrackManager.createTrackWithSteps('snare', [
          false, false, true, false,
          false, false, true, false,
          false, false, true, false,
          false, false, true, false,
        ]),
        TrackManager.createTrackWithSteps('tom', [
          false, false, false, false,
          false, false, false, false,
          false, false, false, false,
          false, false, false, true,
        ]),
        TrackManager.createTrackWithSteps('clap', [
          false, false, false, false,
          true, false, false, false,
          false, false, false, false,
          true, false, false, false,
        ]),
        TrackManager.createTrackWithSteps('cowbell', [
          false, false, false, false,
          false, false, false, true,
          false, false, false, false,
          false, false, false, false,
        ]),
        TrackManager.createTrackWithSteps('closed_hat', [
          true, false, true, false,
          true, false, true, false,
          true, false, true, false,
          true, false, true, false,
        ]),
        TrackManager.createEmptyTrack('open_hat', DEFAULT_STEP_COUNT),
        TrackManager.createEmptyTrack('cymbal', DEFAULT_STEP_COUNT),
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
  static createEmptyTrack(name: string, stepCount: number): Track {
    return {
      name,
      type: TrackType.SAMPLE,
      params: {
        sampleId: name,
      },
      steps: Array.from({ length: stepCount }, () => ({ active: false })),
    };
  }

  static createTrackWithSteps(name: string, steps: boolean[]): Track {
    return {
      name,
      type: TrackType.SAMPLE,
      params: {
        sampleId: name,
      },
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
