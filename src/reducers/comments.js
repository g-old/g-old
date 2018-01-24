import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId, * as fromById from './commentById';
import byDiscussion, * as fromByDiscussion from './commentByDiscussion';
import {
  commentList as commentListSchema,
  comment as commentSchema,
} from './../store/schema';

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
      .map(id => fromById.getComment(state.byId, id)),
    entities,
  );

export const getComment = (state, id, entities) => {
  const comment = fromById.getComment(state.byId, id);
  return denormalize(comment, commentSchema, {
    ...entities,
    comments: state.byId,
    users: entities.users.byId,
  });
};
