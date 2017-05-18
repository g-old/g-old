import { denormalize } from 'normalizr';
import { combineReducers } from 'redux';
import byId from './statementById';
import allIds from './statementsList';
import byPoll, * as fromByPoll from './statementsByPoll';

import { statementArray as statementArraySchema } from './../store/schema';

const statements = combineReducers({
  byId,
  allIds,
  byPoll,
});

export default statements;

export const getAllStatementsByPoll = (state, id, entities) => {
  const stmts = fromByPoll.getAllByPollId(state.byPoll, id);
  return denormalize(stmts, statementArraySchema, {
    ...entities,
    users: entities.users.byId,
    statements: state.byId,
  });
};
