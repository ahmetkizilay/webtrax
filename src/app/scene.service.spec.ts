import { Track, TrackManager, SceneManager } from './scene.service';

describe('TrackManager', () => {
  describe('emptyTrack', () => {
    it('creates a track with the correct name and step count', () => {
      const track: Track = TrackManager.createEmptyTrack('test', 16);
      expect(track.name).toBe('test');
      expect(track.steps.length).toBe(16);
      expect(track.steps.every(step => !step.active)).toBeTrue();
    });
  });

  describe('createTrackWithSteps', () => {
    it('creates a track with the correct name and steps', () => {
      const steps = [true, false, true, false];
      const track: Track = TrackManager.createTrackWithSteps('test', steps);
      expect(track.name).toBe('test');
      expect(track.steps.length).toBe(4);
      expect(track.steps.map(step => step.active)).toEqual(steps);
    });
  });

  describe('fromTrack', () => {
    it('creates a TrackManager from a track', () => {
      const track: Track = TrackManager.createEmptyTrack('test', 16);
      const manager: TrackManager = TrackManager.fromTrack(track);
      expect(manager).toBeDefined();
    });
  });
});

describe('SceneManager', () => {
  describe('createDefaultScene', () => {
    it('creates a scene with the correct name, bpm, and step count', () => {
      const scene = SceneManager.createDefaultScene();
      expect(scene.name).toBe('Scene 1');
      expect(scene.bpm).toBe(128);
      expect(scene.stepCount).toBe(16);
      expect(scene.tracks.length).toBe(8);
      expect(scene.tracks.map(track => track.name)).toEqual([
        'kick', 'snare', 'tom', 'clap',
        'cowbell', 'closed_hat', 'open_hat', 'cymbal',
      ]);
    });
  });

  describe('emptyScene', () => {
    it('creates a scene with the correct name, bpm, and step count', () => {
      const scene = SceneManager.createEmptyScene('test', 120, 16);
      expect(scene.name).toBe('test');
      expect(scene.bpm).toBe(120);
      expect(scene.stepCount).toBe(16);
      expect(scene.tracks).toEqual([]);
    });
  });

  describe('fromScene', () => {
    it('creates a SceneManager from a scene', () => {
      const scene = SceneManager.createEmptyScene('test', 120, 16);
      const manager = SceneManager.fromScene(scene);
      expect(manager).toBeDefined();
    });
  });

  describe('addTrack', () => {
    it('adds a track to the scene', () => {
      const scene = SceneManager.createEmptyScene('test', 120, 16);
      const track = TrackManager.createEmptyTrack('test', 16);
      const manager = SceneManager.fromScene(scene);
      manager.addTrack(track);
      expect(scene.tracks).toEqual([track]);
    });
  });
});
