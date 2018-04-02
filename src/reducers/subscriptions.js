import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import createList, * as fromList from './createSubscriptionList';
import byId, * as fromById from './subscriptionById';
import { subscription as subscriptionSchema } from './../store/schema';

const listByFilter = combineReducers({
  all: createList('all'),
});
export default combineReducers({
  byId,
  listByFilter,
});

/*
const hydrateList = (state, data, entities) =>
  denormalize(data, subscriptionListSchema, {
    ...entities,
  }); */

export const getStatus = (state, filter) =>
  fromList.getStatus(state.listByFilter[filter]);
const hydrateEntity = (data, entities) =>
  denormalize(data, subscriptionSchema, entities);

export const getEntity = (state, id, entities) => {
  const subscription = fromById.getEntity(state.byId, id);
  return hydrateEntity(subscription, entities);
};
