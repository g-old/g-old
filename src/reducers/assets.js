import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import createList, * as fromList from './createAssetList';
import byId, * as fromById from './assetById';
import {
  assetList as assetListSchema,
  asset as assetSchema,
} from './../store/schema';

const listByFilter = combineReducers({
  all: createList('all'),
});
export default combineReducers({
  byId,
  listByFilter,
});

const hydrateList = (state, data, entities) =>
  denormalize(data, assetListSchema, {
    ...entities,
  });

export const getStatus = (state, filter) =>
  fromList.getStatus(state.listByFilter[filter]);
const hydrateEntity = (data, entities) =>
  denormalize(data, assetSchema, entities);

export const getEntity = (state, id, entities) => {
  const asset = fromById.getEntity(state.byId, id);
  return hydrateEntity(asset, entities);
};

export const getVisible = (state, filter, entities) => {
  const ids = fromList.getIds(state.listByFilter[filter]);
  const data = ids.map(id => fromById.getEntity(state.byId, id));
  return hydrateList(state, data, entities);
};
