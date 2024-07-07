import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportComponent } from './transport.component';
import { TransportService, TransportState, TransportStatus } from './transport.service';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('TransportComponent', () => {
  let component: TransportComponent;
  let fixture: ComponentFixture<TransportComponent>;

  let mockTransportState$: Subject<TransportState>;
  let mockStartFn: jasmine.Spy;
  let mockStopFn: jasmine.Spy;
  let mockSetBpmFn: jasmine.Spy;

  beforeEach(() => {
    mockTransportState$ = new Subject<TransportState>();
    mockStartFn = jasmine.createSpy();
    mockStopFn = jasmine.createSpy();
    mockSetBpmFn = jasmine.createSpy();

    let mockTransportService = {
      transportState$: mockTransportState$,
      start: mockStartFn,
      stop: mockStopFn,
      setBpm: mockSetBpmFn,
    };
    TestBed.configureTestingModule({
      imports: [TransportComponent],
      providers: [
        { provide: TransportService, useValue: mockTransportService},
      ]
    });
    fixture = TestBed.createComponent(TransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('starts transport service when play button is clicked', () => {
    let playButton = fixture.debugElement.query(By.css('button.play'));
    playButton.triggerEventHandler('click', null);
    expect(mockStartFn).toHaveBeenCalled();
  });

  it('stops transport service when stop button is clicked', () => {
    let stopButton = fixture.debugElement.query(By.css('button.stop'));
    stopButton.triggerEventHandler('click', null);
    expect(mockStopFn).toHaveBeenCalled();
  });

  it('updates buttons when transport is playing', () => {
    mockTransportState$.next({ status: TransportStatus.PLAYING, bpm: 120 });
    fixture.detectChanges();
    let playButton = fixture.debugElement.query(By.css('button.play'));
    expect(playButton.nativeElement.disabled).toBeTruthy();

    let stopButton = fixture.debugElement.query(By.css('button.stop'));
    expect(stopButton.nativeElement.disabled).toBeFalsy();
  });

  it('updates buttons when transport is stopped', () => {
    mockTransportState$.next({ status: TransportStatus.STOPPED, bpm: 120 });
    fixture.detectChanges();
    let playButton = fixture.debugElement.query(By.css('button.play'));
    expect(playButton.nativeElement.disabled).toBeFalsy();

    let stopButton = fixture.debugElement.query(By.css('button.stop'));
    expect(stopButton.nativeElement.disabled).toBeTruthy();
  });

  it('updates bpm input when transport state changes', () => {
    mockTransportState$.next({ status: TransportStatus.STOPPED, bpm: 120 });
    fixture.detectChanges();
    let bpmInput = fixture.debugElement.query(By.css('input'));
    expect(bpmInput.nativeElement.value).toBe('120');
  });

  it('sets the bpm when input changes', () => {
    let bpmInput = fixture.debugElement.query(By.css('input'));
    bpmInput.nativeElement.value = '130';
    bpmInput.triggerEventHandler('change', { target: bpmInput.nativeElement });
    expect(mockSetBpmFn).toHaveBeenCalledWith(130);
  });
});
