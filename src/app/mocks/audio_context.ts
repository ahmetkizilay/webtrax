class MockAudioParam {
  setValueAtTime(val: number, time: number) {}
}

class MockNode {
  connections: MockNode[] = [];
  connect(node: MockNode) {
    this.connections.push(node);
  }
}

export class MockDelayNode extends MockNode {
  delayTime: MockAudioParam = new MockAudioParam();
}

export class MockAudioContext {
  state: string = 'suspended';
  registeredEvents: Map<string, Function[]> = new Map();
  nodes: MockNode[] = [];

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
    let gainNode = new MockNode();
    this.nodes.push(gainNode);
    return gainNode;
  }

  createDelay() {
    let delayNode = new MockDelayNode();
    this.nodes.push(delayNode);
    return delayNode;
  }
}
