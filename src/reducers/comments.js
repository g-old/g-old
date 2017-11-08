import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId, * as fromById from './commentById';
import byDiscussion, * as fromByDiscussion from './commentByDiscussion';
import { commentList as commentListSchema } from './../store/schema';

export default combineReducers({
  byId,
  byDiscussion,
});

const hydrateComments = (state, data, entities) =>
  denormalize(data, commentListSchema, {
    ...entities,
    comments: state.byId,
    users: entities.users.byId,
  });

export const getCommentsByDiscussion = (state, wTDiscId, entities) =>
  hydrateComments(
    state,
    fromByDiscussion
      .getIds(state.byDiscussion, wTDiscId)
      .map(id => fromById.getDiscussion(state.byId, id)),
    entities,
  );
