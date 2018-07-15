import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import all, * as fromList from './discussionList';
import byId, * as fromById from './discussionById';
import byWT, * as fromByWorkTeam from './discussionsByWorkTeam';
import byState, * as fromByState from './discussionsByState';

import { discussionList as discussionListSchema } from './../store/schema';

export default combineReducers({
  byId,
  byWT,
  all,
  byState,
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
      subscriptions: entities.subscriptions.byId,
    },
  );

export const getIsFetching = state => fromList.getIsFetching(state.all);
export const getErrorMessage = state => fromList.getErrorMessage(state.all);

export const getDiscussion = (state, id, entities) => {
  const discussion = fromById.getDiscussion(state.byId, id);
  const hydrated = hydrateDiscussions(state, [discussion], entities);
  return hydrated.discussions ? hydrated.discussions[0] : {};
};

export const getWTDiscussionsByState = (state, wtId, filter, entities) => {
  const discussionIds = fromByWorkTeam.getIds(state.byWT, wtId);
  const filtered = fromByState.getIds(state.byState, filter);

  const results = discussionIds.filter(id => filtered.find(sId => sId === id));
  const hydrated = hydrateDiscussions(state, results, entities);

  return hydrated.discussions || [];
};

export const getDiscussionsByWT = (state, tagId, entities) => {
  const hydrated = hydrateDiscussions(
    state,
    fromByWorkTeam.getIds(state.byWT, tagId),
    entities,
  );

  return hydrated.discussions || [];
};

export const getPageInfo = (state, filter) => ({
  ...fromByState.getPageInfo(state.byState[filter]),
});
