import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId, * as fromById from './plattformById';
import { plattform as plattformSchema } from '../store/schema';

export default combineReducers({
  byId,
});

const hydrateEntity = (data, entities) =>
  denormalize(data, plattformSchema, entities);

export const getEntity = (state, id, entities) => {
  const plattform = fromById.getEntity(state.byId, id);
  return hydrateEntity(plattform, entities);
};
