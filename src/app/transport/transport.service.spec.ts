import { TestBed } from '@angular/core/testing';
import {
  ClockProvider,
  TransportService,
  TransportStatus,
} from './transport.service';
import { Observable, Subject, firstValueFrom, map, timestamp } from 'rxjs';

class MockClockProvider {
  tick$: Observable<{ timestamp: number }>;
  constructor(tick: Subject<number>) {
    this.tick$ = tick.pipe(map((val) => ({ timestamp: val })));
  }
}

describe('TransportService', () => {
  let tick$: Subject<number>;
  beforeEach(() => {
    tick$ = new Subject<number>();

    TestBed.configureTestingModule({
      providers: [
        { provide: ClockProvider, useValue: new MockClockProvider(tick$) },
        TransportService,
      ],
    });
  });

  it('initializes in stopped state', (done) => {
    let service = TestBed.inject(TransportService);

    service.transportState$.subscribe((state) => {
      expect(state.status).toBe(TransportStatus.STOPPED);
      expect(state.bpm).toBe(128);
      done();
    });
  });

  it('sets the transport state', async () => {
    let service = TestBed.inject(TransportService);

    service.start();
    let startedState = await firstValueFrom(service.transportState$);
    expect(startedState.status).toBe(TransportStatus.PLAYING);

    service.stop();
    let stoppedState = await firstValueFrom(service.transportState$);
    expect(stoppedState.status).toBe(TransportStatus.STOPPED);
  });

  it('sets the bpm', async () => {
    let service = TestBed.inject(TransportService);

    let beforeState = await firstValueFrom(service.transportState$);
    expect(beforeState.bpm).toBe(128);

    service.setBpm(100);
    let state = await firstValueFrom(service.transportState$);
    expect(state.bpm).toBe(100);
  });

  it('emits a beat', () => {
    let service = TestBed.inject(TransportService);

    // 60bpm is 1 beat per second
    // 1 beat per second is 1 beat per 1000ms
    // given the division of the beat is 4,
    // the beat should be emitted ~every 250ms
    service.setBpm(60);

    let sub = jasmine.createSpy('onBeat');
    service.onBeat.subscribe(sub);

    // service is in stopped state, no beats should be emitted.
    tick$.next(0);
    expect(sub).not.toHaveBeenCalled();
    tick$.next(0.5);
    expect(sub).not.toHaveBeenCalled();

    // We need to start the service to get the beats.
    service.start();

    // the first beat should be emitted immediately.
    tick$.next(1);
    expect(sub).toHaveBeenCalledWith(0);
    sub.calls.reset();

    tick$.next(1.01);
    expect(sub).not.toHaveBeenCalled();

    tick$.next(1.25);
    // it should have been called with 0, because we are at time
    expect(sub).toHaveBeenCalledWith(0);
    sub.calls.reset();

    tick$.next(1.495);
    // if we are close to the beat (within 0.01s), we should emit the beat.
    expect(sub).toHaveBeenCalled();
    expect(sub.calls.mostRecent().args[0]).toBeCloseTo(0.005, 2);
    sub.calls.reset();

    // after stopping the service, no more beats should be emitted.
    service.stop();

    tick$.next(3);
    expect(sub).not.toHaveBeenCalled();
  });
});
