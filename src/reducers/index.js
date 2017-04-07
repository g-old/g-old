import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import intl from './intl';
import entities from './entities';
import ui from './ui';

export default combineReducers({
  user,
  runtime,
  intl,
  entities,
  ui,
});
