import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId, * as fromById from './messageById';
import { message as messageSchema } from './../store/schema';

export default combineReducers({
  byId,
});

export const getStatus = state => ({
  error: state.all.errorMessage,
  pending: state.all.pending,
});
const hydrateEntity = (data, entities) =>
  denormalize(data, messageSchema, {
    users: entities.users.byId,
  });

export const getEntity = (state, id, entities) => {
  const message = fromById.getEntity(state.byId, id);
  return hydrateEntity(message, entities);
};
