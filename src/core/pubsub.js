// @flow
import { EventEmitter } from 'events';
import { eventsToAsyncIterator } from './events-to-async-iterator';

export default class PubSub {
  ee: EventEmitter;

  subscriptions = {};

  subIdCounter: number;

  onlineUsers: Map<number, ID>;

  constructor() {
    this.ee = new EventEmitter();
    this.ee.setMaxListeners(0); // or set to a specific number
    this.subscriptions = {};
    this.subIdCounter = 0;
    this.onlineUsers = new Map();
  }

  publish(triggerName: string, payload: any) {
    this.ee.emit(triggerName, payload);
    return true;
  }

  getOnlineUsers() {
    return this.onlineUsers;
  }

  subscribe(
    triggerName: string,
    onMessage: any => Promise<any>,
    userId: ID,
  ): Promise<number> {
    this.ee.addListener(triggerName, onMessage);
    this.subIdCounter = this.subIdCounter + 1;
    this.subscriptions[this.subIdCounter] = [triggerName, onMessage];
    this.onlineUsers.set(this.subIdCounter, userId);
    return Promise.resolve(this.subIdCounter);
  }

  unsubscribe(subId: number) {
    const [triggerName, onMessage] = this.subscriptions[subId];
    delete this.subscriptions[subId];
    this.ee.removeListener(triggerName, onMessage);
    this.onlineUsers.delete(subId);
  }

  asyncIterator(triggers: string) {
    return eventsToAsyncIterator(this.ee, triggers);
  }
}
