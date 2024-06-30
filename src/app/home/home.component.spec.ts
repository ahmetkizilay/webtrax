import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { SampleLibraryService } from '../sample-library.service';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';

class MockAudioContext {
  state: string = 'suspended';
  registeredEvents: Map<string, Function[]> = new Map();

  addEventListener(eventName:string, fn: Function) {
    let currentRegisteredEvents = this.registeredEvents.get(eventName) || [];
    this.registeredEvents.set(eventName, [...currentRegisteredEvents, fn]);
  }
  removeEventListener(eventName: string, fn: Function) {
    let currentRegisteredEvents = this.registeredEvents.get(eventName) || [];
    this.registeredEvents.set(eventName, currentRegisteredEvents.filter((f) => f !== fn));
  }

  resume() {
    this.state = 'running';
    let currentRegisteredEvents = this.registeredEvents.get('statechange') || [];
    currentRegisteredEvents.forEach((fn) => fn());
  }

  mockSuspend() {
    this.state = 'suspended';
    let currentRegisteredEvents = this.registeredEvents.get('statechange') || [];
    currentRegisteredEvents.forEach((fn) => fn());
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let mockAudioContext: MockAudioContext;

  beforeEach(() => {
    mockAudioContext = new MockAudioContext();
    TestBed.configureTestingModule({
      providers: [
        { provide: AudioContext, useValue: mockAudioContext},
        { provide: SampleLibraryService, useValue: {
          onStatusChange$: new Subject(),
        }}
      ],
      imports: [HomeComponent]
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('resumes audio after initial modal click', () => {
    let modal = fixture.debugElement.query(By.css('.modal-audio'));

    modal.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(mockAudioContext.state).toBe('running');
    expect(fixture.debugElement.query(By.css('.modal-audio'))).toBeFalsy();

    mockAudioContext.mockSuspend();
    fixture.detectChanges();

    expect(mockAudioContext.state).toBe('suspended');
    expect(fixture.debugElement.query(By.css('.modal-audio'))).toBeTruthy();
  });

  it('removes audio statechange listener on destroy', () => {
    fixture.destroy();
    fixture.detectChanges();
    expect(mockAudioContext.registeredEvents.get('statechange')).toHaveSize(0);
  });
});
