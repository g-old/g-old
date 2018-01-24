import { LOAD_REPLIES_SUCCESS /* LOAD_FEED_SUCCESS */ } from '../constants';

const sort = (state, comments) =>
  Object.keys(comments).reduce((acc, curr) => {
    const comment = comments[curr];
    if (!comment.discussionId) return acc;
    if (acc[comment.discussionId]) {
      acc[comment.discussionId] = [
        ...new Set([curr, ...acc[comment.discussionId]]),
      ];
    } else {
      acc[comment.discussionId] = [...new Set([curr])];
    }

    return acc;
  }, state);

const byDiscussion = (state = {}, action) => {
  switch (action.type) {
    //  case LOAD_FEED_SUCCESS:
    case LOAD_REPLIES_SUCCESS: {
      const comments = action.payload.entities.comments;
      if (!comments) return state;
      const sorted = sort(state, comments);
      return {
        ...sorted,
      };
    }

    default: {
      return state;
    }
  }
};
export default byDiscussion;

export const getIds = (state, id) => (state[id] ? state[id] : []);
