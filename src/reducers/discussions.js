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
  denormalize(
    { discussions: data },
    { discussions: discussionListSchema },
    {
      ...entities,
      discussions: state.byId,
      users: entities.users.byId,
      comments: entities.comments.byId,
    },
  );

export const getIsFetching = state => fromList.getIsFetching(state.all);
export const getErrorMessage = state => fromList.getErrorMessage(state.all);

export const getDiscussion = (state, id, entities) => {
  const discussion = fromById.getDiscussion(state.byId, id);
  const hydrated = hydrateDiscussions(state, [discussion], entities);
  return hydrated.discussions ? hydrated.discussions[0] : {};
};

export const getDiscussionsByWT = (state, tagId, entities) => {
  const hydrated = hydrateDiscussions(
    state,
    fromByWorkTeam.getIds(state.byWT, tagId),
    entities,
  );

  return hydrated.discussions || [];
};
