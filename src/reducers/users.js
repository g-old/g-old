import { combineReducers } from 'redux';

import { denormalize } from 'normalizr';
import byId, * as fromById from './userById';
import { user as userSchema } from '../store/schema';

export default combineReducers({
  byId,
});

const hydrateUser = (data, entities) => denormalize(data, userSchema, entities);

export const getUser = (state, id, entities) => {
  const user = fromById.getUser(state.byId, id);
  return hydrateUser(user, {
    ...entities,
    users: entities.users.byId,
    workTeams: entities.workTeams.byId,
    requests: entities.requests.byId,
    messages: entities.messages.byId,
  });
};
