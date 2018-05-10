import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId, * as fromById from './subscriptionById';
import { subscription as subscriptionSchema } from './../store/schema';

export default combineReducers({
  byId,
});

/*
const hydrateList = (state, data, entities) =>
  denormalize(data, subscriptionListSchema, {
    ...entities,
  }); */

const hydrateEntity = (data, entities) =>
  denormalize(data, subscriptionSchema, entities);

export const getEntity = (state, id, entities) => {
  const subscription = fromById.getEntity(state.byId, id);
  return hydrateEntity(subscription, entities);
};
