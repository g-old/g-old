import merge from 'lodash.merge';
import { denormalize } from 'normalizr';
import { combineReducers } from 'redux';
import {
  voteList as voteListSchema,
  userList as userListSchema,
} from '../store/schema';
import {
  LOAD_PROPOSAL_SUCCESS,
  FETCH_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
} from '../constants';

const allIds = (state = [], action) => {
  switch (action.type) {
    case LOAD_PROPOSAL_SUCCESS: {
      const { polls } = action.payload.entities;
      if (polls) {
        const ids = Object.keys(polls).reduce((acc, curr) => {
          const voteIds = polls[curr].followees || [];
          return acc.concat(
            voteIds.map(vId => {
              const vote = action.payload.entities.votes[vId];
              return vote.voter;
            }),
          );
        }, []);
        return [...new Set([...state, ...ids])];
      }
      return state;
    }

    case UPDATE_USER_SUCCESS: {
      if (action.properties.followee) {
        return Object.keys(action.payload.entities.users).filter(
          id => id !== action.payload.result,
        );
      }
      return state;
    }
    case FETCH_USER_SUCCESS: {
      const { users } = action.payload.entities;
      return [
        ...new Set([
          ...state,
          ...Object.keys(users).filter(id => id !== action.payload.result),
        ]),
      ];
    }

    default:
      return state;
  }
};

const votesByPoll = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_USER_SUCCESS: {
      if (action.properties.followee && action.info && action.info.delete)
        return {};
      return action.properties.followee && action.info && action.info.voteId
        ? {
            ...state,
            [action.info.pollId]: [
              ...state[action.info.pollId],
              action.info.voteId,
            ],
          }
        : state;
    }
    case LOAD_PROPOSAL_SUCCESS: {
      const { polls } = action.payload.entities;
      if (polls) {
        const pollVotes = Object.keys(polls).reduce((acc, curr) => {
          const voteIds = polls[curr].followees || [];

          return { ...acc, [curr]: [...voteIds] };
        }, {});
        return merge({}, state, pollVotes);
      }
      return state;
    }

    default:
      return state;
  }
};

const votesByFollowee = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_USER_SUCCESS: {
      if (action.properties.followee && action.info && action.info.delete) {
        const { [action.info.id]: toDelete, ...rest } = state;
        return { ...rest };
      }
      return state;
    }
    case LOAD_PROPOSAL_SUCCESS: {
      const { polls, votes } = action.payload.entities;
      if (!polls) return state;
      const followeeVotes = Object.keys(polls).reduce((acc, curr) => {
        const voteIds = polls[curr].followees || [];

        const followeesWithVote = voteIds.reduce(
          (a, c) => ({
            ...a,
            [votes[c].voter]: [
              ...(a[votes[c].voter] ? a[votes[c].voter] : []),
              c,
            ],
          }),
          acc,
        );
        return followeesWithVote;
      }, {});
      const newState = Object.keys(followeeVotes).reduce(
        (ac, cu) => ({
          ...ac,
          [cu]: [
            ...new Set([...(state[cu] ? state[cu] : []), ...followeeVotes[cu]]),
          ],
        }),
        {},
      );

      return merge({}, state, newState);
    }

    default:
      return state;
  }
};

const followees = combineReducers({
  allIds,
  votesByPoll,
  votesByFollowee,
});

export default followees;
const getVotes = (state, pollId) => state[pollId];

export const getFolloweeVotesByPoll = (state, pollId) => {
  const voteIds = getVotes(state.followees.votesByPoll, pollId);
  if (!voteIds) return [];
  const votes = denormalize(voteIds, voteListSchema, {
    ...state,
    users: state.users.byId,
  });
  return votes;
};

export const getFollowees = state => {
  const ids = state.followees.allIds;
  return denormalize(ids, userListSchema, {
    ...state,
    users: state.users.byId,
  });
};
