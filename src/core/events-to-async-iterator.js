/* eslint-disable import/prefer-default-export */
import { $$asyncIterator } from 'iterall';

export function eventsToAsyncIterator(eventEmitter, eventsNames) {
  const pullQueue = [];
  const pushQueue = [];
  const eventsArray =
    typeof eventsNames === 'string' ? [eventsNames] : eventsNames;
  let listening = true;
  const pushValue = event => {
    if (pullQueue.length !== 0) {
      pullQueue.shift()({ value: event, done: false });
    } else {
      pushQueue.push(event);
    }
  };

  const pullValue = () =>
    new Promise(resolve => {
      if (pushQueue.length !== 0) {
        resolve({ value: pushQueue.shift(), done: false });
      } else {
        pullQueue.push(resolve);
      }
    });

  const addEventListener = () => {
    eventsArray.forEach(eventName =>
      eventEmitter.addListener(eventName, pushValue),
    );
  };

  const removeEventListeners = () => {
    eventsArray.forEach(eventName =>
      eventEmitter.removeListener(eventName, pushValue),
    );
  };
  const emptyQueue = () => {
    if (listening) {
      listening = false;
      removeEventListeners();
      pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
      pullQueue.length = 0;
      pushQueue.length = 0;
    }
  };

  addEventListener();
  return {
    next() {
      return listening ? pullValue() : this.return();
    },
    return() {
      emptyQueue();

      return Promise.resolve({ value: undefined, done: true });
    },
    throw(error) {
      emptyQueue();

      return Promise.reject(error);
    },
    [$$asyncIterator]() {
      return this;
    },
  };
}
