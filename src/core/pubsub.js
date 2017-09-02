import { EventEmitter } from 'events';
import { eventsToAsyncIterator } from './events-to-async-iterator';

export default class PubSub {
  constructor() {
    this.ee = new EventEmitter();
    this.ee.setMaxListeners(0); // or set to a specific number
    this.subscriptions = {};
    this.subIdCounter = 0;
  }

  publish(triggerName, payload) {
    this.ee.emit(triggerName, payload);
    return true;
  }

  subscribe(triggerName, onMessage) {
    this.ee.addListener(triggerName, onMessage);
    this.subIdCounter = this.subIdCounter + 1;
    this.subscriptions[this.subIdCounter] = [triggerName, onMessage];
    return Promise.resolve(this.subIdCounter);
  }

  unsubscribe(subId) {
    const [triggerName, onMessage] = this.subscriptions[subId];
    delete this.subscriptions[subId];
    this.ee.removeListener(triggerName, onMessage);
  }
  asyncIterator(triggers) {
    return eventsToAsyncIterator(this.ee, triggers);
  }
}
