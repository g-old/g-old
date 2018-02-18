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
  denormalize(
    { comments: data },
    { comments: commentListSchema },
    {
      ...entities,
      comments: state.byId,
      users: entities.users.byId,
    },
  );

export const getCommentsByDiscussion = (state, wTDiscId, entities) => {
  const hydrated = hydrateComments(
    state,
    fromByDiscussion.getIds(state.byDiscussion, wTDiscId),
    entities,
  );
  return hydrated.comments || [];
};

export const getComment = (state, id, entities) => {
  const comment = fromById.getComment(state.byId, id);
  return denormalize(comment, commentSchema, {
    ...entities,
    comments: state.byId,
    users: entities.users.byId,
  });
};
