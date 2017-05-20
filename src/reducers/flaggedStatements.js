import merge from 'lodash.merge';
import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import { flaggedStatementArray } from './../store/schema';

import { LOAD_FLAGGEDSTMTS_SUCCESS, UPDATE_FLAGGEDSTMT_SUCCESS } from '../constants';

const byId = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_FLAGGEDSTMT_SUCCESS:
    case LOAD_FLAGGEDSTMTS_SUCCESS: {
      return merge({}, state, action.payload.entities.flaggedStatements);
    }
    default:
      return state;
  }
};

const allIds = (state = [], action) => {
  switch (action.type) {
    case LOAD_FLAGGEDSTMTS_SUCCESS: {
      return [...new Set([...state, ...action.payload.result])];
    }
    default:
      return state;
  }
};

const flaggedStatements = combineReducers({
  byId,
  allIds,
});

export default flaggedStatements;

const hydrateStatements = (data, entities) =>
  denormalize(data, flaggedStatementArray, {
    ...entities,
    users: entities.users.byId,
    statements: entities.statements.byId,
    flaggedStatements: entities.flaggedStatements.byId,
  });

export const getStatements = (state, entities) =>
  hydrateStatements(state.allIds.map(s => state.byId[s]), entities);
