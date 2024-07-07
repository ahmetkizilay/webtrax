class MockAudioParam {
  setValueAtTime() {}
}

class MockNode {
  connect() {}
}

class MockDelayNode extends MockNode {
  delayTime: MockAudioParam = new MockAudioParam();
}

export class MockAudioContext {
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

  createGain() {
    return new MockNode();
  }

  createDelay() {
    return new MockDelayNode();
  }
}
