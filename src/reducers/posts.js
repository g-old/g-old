import { combineReducers } from 'redux';
import { denormalize } from 'normalizr';
import byId from './postById';
import { posts as postListSchema } from './../store/schema';
import {
  LOAD_FEED_SUCCESS,
  LOAD_FEED_ERROR,
  LOAD_FEED_START,
} from '../constants';

const all = (state = { ids: [] }, action) => {
  switch (action.type) {
    case LOAD_FEED_SUCCESS:
      return {
        ids: action.payload.result,
        pending: false,
        error: null,
      };
    case LOAD_FEED_ERROR:
      return {
        ...state,
        pending: false,
        error: action.payload.error,
      };
    case LOAD_FEED_START:
      return {
        ...state,
        pending: true,
        error: null,
      };

    default:
      return state;
  }
};
export default combineReducers({
  byId,
  all,
});

const hydratePosts = (state, data, entities) =>
  denormalize(
    { posts: data },
    { posts: postListSchema },
    {
      ...entities,
      users: entities.users.byId,
      workTeams: entities.workTeams.byId,
    },
  );

export const getStatus = state => ({
  pending: state.all.pending,
  error: state.all.error,
});

export const getAllPosts = (state, entities) => {
  const { ids } = state.all;
  const hydrated = hydratePosts(state, ids, entities);
  return hydrated.posts || [];
};
