import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import createList, * as fromList from './createRequestList';
import byId, * as fromById from './requestById';
import {
  requestList as requestListSchema,
  request as requestSchema,
} from './../store/schema';

const listByFilter = combineReducers({
  all: createList('all'),
});
export default combineReducers({
  byId,
  listByFilter,
});

const hydrateList = (state, data, entities) =>
  denormalize(data, requestListSchema, {
    ...entities,
  });

export const getStatus = (state, filter) =>
  fromList.getStatus(state.listByFilter[filter]);
const hydrateEntity = (data, entities) =>
  denormalize(data, requestSchema, entities);

export const getEntity = (state, id, entities) => {
  const request = fromById.getEntity(state.byId, id);
  return hydrateEntity(request, entities);
};

export const getVisible = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const data = ids.map(id => fromById.getEntity(state.byId, id));
  return hydrateList(state, data, entities);
};
