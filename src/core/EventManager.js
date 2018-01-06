import { EventEmitter } from 'events';

class EventManager {
  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(0);
  }
  subscribe(eventName, listener) {
    this.emitter.addListener(eventName, listener);
  }
  unSubscribe(eventName, listener) {
    this.emitter.removeListener(eventName, listener);
  }
  publish(eventName, args) {
    this.emitter.emit(eventName, args);
  }
}

export default new EventManager();
