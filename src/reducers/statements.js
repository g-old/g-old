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

export const getVisibibleStatementsByPoll = (state, id, entities, filter) => {
  const byePoll = fromByPoll.getFilteredByPollId(state.byPoll, id);
  const den = denormalize(byePoll[filter], statementArraySchema, {
    ...entities,
    users: entities.users.byId,
    statements: state.byId,
  });
  return den;
};
