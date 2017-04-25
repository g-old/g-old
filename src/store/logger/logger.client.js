import { createLogger } from 'redux-logger';

export default function createReduxLogger() {
  return createLogger({
    collapsed: true,
  });
}
