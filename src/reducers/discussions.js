import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import all, * as fromList from './discussionList';
import byId, * as fromById from './discussionById';
import byWT, * as fromByWorkTeam from './discussionsByWorkTeam';
import { discussionList as discussionListSchema } from './../store/schema';

export default combineReducers({
  byId,
  byWT,
  all,
});

const hydrateDiscussions = (state, data, entities) =>
  denormalize(data, discussionListSchema, {
    ...entities,
    discussions: state.byId,
    users: entities.users.byId,
  });

export const getIsFetching = state => fromList.getIsFetching(state.all);
export const getErrorMessage = state => fromList.getErrorMessage(state.all);

export const getDiscussion = (state, id, entities) => {
  const discussion = fromById.getDiscussion(state.byId, id);
  return hydrateDiscussions(state, [discussion], entities)[0];
};

export const getDiscussionsByWT = (state, tagId, entities) =>
  hydrateDiscussions(
    state,
    fromByWorkTeam
      .getIds(state.byWT, tagId)
      .map(id => fromById.getDiscussion(state.byId, id)),
    entities,
  );
