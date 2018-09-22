import merge from 'lodash.merge';
import {
  LOAD_PROPOSAL_LIST_SUCCESS,
  LOAD_PROPOSAL_SUCCESS,
  LOAD_NOTIFICATIONS_SUCCESS,
  LOAD_VOTES_SUCCESS,
  CREATE_VOTE_SUCCESS,
  UPDATE_VOTE_SUCCESS,
  DELETE_VOTE_SUCCESS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  CREATE_LIKE_SUCCESS,
  DELETE_LIKE_SUCCESS,
  LOAD_FEED_SUCCESS,
  CREATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_SUCCESS,
  LOAD_WORKTEAM_SUCCESS,
  SSE_UPDATE_SUCCESS,
  LOAD_ACTIVITIES_SUCCESS,
} from '../constants';

const updatePolls = (state, action) => {
  let deleteVote;
  let updatedPolls;
  let updateVote;
  const activity = action.payload.entities.activities[action.payload.result];
  if (activity && activity.type === 'vote') {
    if (activity.verb === 'delete') {
      deleteVote = true;
    } else if (activity.verb === 'update') {
      updateVote = true;
    }

    updatedPolls = Object.keys(action.payload.entities.votes).reduce(
      (agg, curr) => {
        const vote = action.payload.entities.votes[curr];
        if (state[vote.pollId]) {
          const newOptions = [];
          const { options } = state[vote.pollId];
          for (let i = 0; i < options.length; i += 1) {
            const option = options[i];
            if (vote.positions[0].pos === 0) {
              // upvote
              if (updateVote) {
                if (option.pos === vote.positions[0].pos) {
                  newOptions.push({
                    ...option,
                    numVotes: option.numVotes + 1,
                  });
                } else {
                  newOptions.push({
                    ...option,
                    numVotes: option.numVotes - 1,
                  });
                }
              } else if (option.pos === vote.positions[0].pos) {
                newOptions.push({
                  ...option,
                  numVotes: deleteVote
                    ? option.numVotes - 1
                    : option.numVotes + 1,
                });
              } else {
                newOptions.push({
                  ...option,
                });
              }
            } else if (updateVote) {
              // downvote
              if (option.pos === vote.positions[0].pos) {
                newOptions.push({
                  ...option,
                  numVotes: option.numVotes + 1,
                });
              } else {
                newOptions.push({
                  ...option,
                  numVotes: option.numVotes - 1,
                });
              }
            } else if (option.pos === vote.positions[0].pos) {
              newOptions.push({
                ...option,
                numVotes: deleteVote
                  ? option.numVotes - 1
                  : option.numVotes + 1,
              });
            } else {
              newOptions.push({
                ...option,
              });
            }
          }
          // eslint-disable-next-line no-param-reassign
          agg[vote.pollId] = { ...state[vote.pollId], options: newOptions };
        }
        return agg;
      },
      {},
    );
  }
  return updatedPolls;
};

export default function polls(state = {}, action) {
  switch (action.type) {
    case CREATE_VOTE_SUCCESS: {
      const vote = action.payload.entities.votes[action.payload.result];
      const index = vote.positions[0].pos === 0 ? 0 : 1;
      let votes = state[vote.pollId].votes; // eslint-disable-line
      if (votes) {
        votes = [...state[vote.pollId].votes, vote.id];
      }
      // index === 0 means upvote, -> options[index].numVotes + = 1;
      const newOptions = [];
      const { options } = state[vote.pollId];
      for (let i = 0; i < options.length; i += 1) {
        const option = options[i];
        if (option.pos === index) {
          newOptions.push({ ...option, numVotes: option.numVotes + 1 });
        } else {
          newOptions.push({ ...option });
        }
      }
      return {
        ...state,
        [vote.pollId]: {
          ...state[vote.pollId],
          ownVote: vote.id,
          options: newOptions,
          votes,
        },
      };
    }
    case LOAD_VOTES_SUCCESS:
      // const newEntries = Object.keys(action.payload.proposals) || [];
      // return [...new Set([...state, ...newEntries])];
      return {
        ...state,
        [action.id]: { ...state[action.id], votes: [...action.payload.result] },
      }; // TODO merge!
    case LOAD_NOTIFICATIONS_SUCCESS:
    case UPDATE_PROPOSAL_SUCCESS:
    case CREATE_PROPOSAL_SUCCESS:
    case LOAD_WORKTEAM_SUCCESS:
    case LOAD_PROPOSAL_SUCCESS:
      return merge({}, state, action.payload.entities.polls);
    case SSE_UPDATE_SUCCESS: {
      // ! Works only if we are not including the poll
      let updatedPolls;
      if (action.payload.entities.votes) {
        updatedPolls = updatePolls(state, action);
      }
      if (updatedPolls || action.payload.entities.polls) {
        return merge({}, state, updatedPolls, action.payload.entities.polls);
      }
      return state;
    }
    case LOAD_PROPOSAL_LIST_SUCCESS: {
      return merge({}, state, action.payload.entities.polls);
    }
    case LOAD_ACTIVITIES_SUCCESS:
    case LOAD_FEED_SUCCESS: {
      return merge({}, state, action.payload.entities.polls);
    }
    case UPDATE_VOTE_SUCCESS: {
      const { pollId, positions } = action.payload.entities.votes[
        action.payload.result
      ];
      const poll = state[pollId];
      const index = positions[0].pos === 0 ? 0 : 1;
      const statementId = action.info;
      const newOptions = [];
      const { options, extended } = state[pollId];
      if (extended) {
        let added = false;
        let changedOptionPos;
        // TODO extract fn
        const newPositions = positions.reduce((obj, position) => {
          // eslint-disable-next-line
          obj[position.pos] = position;
          return obj;
        }, {});
        const oldPositions = action.oldVote.positions.reduce(
          (obj, position) => {
            // eslint-disable-next-line
            obj[position.pos] = position;
            return obj;
          },
          {},
        );
        if (positions.length > action.oldVote.positions.length) {
          added = true;
          // vote was added - get new position and update options.numVotes
          positions.forEach(element => {
            if (!oldPositions[element.pos]) {
              changedOptionPos = element.pos;
            }
          });
        } else {
          action.oldVote.positions.forEach(element => {
            if (!newPositions[element.pos]) {
              changedOptionPos = element.pos;
            }
          });
        }

        // update options
        for (let i = 0; i < options.length; i += 1) {
          const option = options[i];
          if (option.pos === changedOptionPos) {
            newOptions.push({
              ...option,
              numVotes: added ? option.numVotes + 1 : option.numVotes - 1,
            });
          } else {
            newOptions.push(option);
          }
        }
        return {
          ...state,
          [pollId]: {
            ...poll,
            options: newOptions,
            ownStatement: statementId ? null : state[pollId].ownStatement,
          },
        };
      }
      for (let i = 0; i < options.length; i += 1) {
        const option = options[i];
        if (option.pos === index) {
          newOptions.push({ ...option, numVotes: option.numVotes + 1 });
        } else {
          newOptions.push({
            ...option,
            numVotes: option.numVotes - 1,
          });
        }
      }

      return {
        ...state,
        [pollId]: {
          ...poll,
          options: newOptions,
          ownStatement: statementId ? null : state[pollId].ownStatement,
        },
      };
    }
    case DELETE_VOTE_SUCCESS: {
      const vote = action.payload.entities.votes[action.payload.result];
      const index = vote.positions[0].pos === 0 ? 0 : 1;
      const poll = state[vote.pollId];
      let { statements, votes } = poll;

      if (poll.ownStatement && poll.statements) {
        // eslint-disable-next-line eqeqeq
        statements = poll.statements.filter(id => id != poll.ownStatement);
      }
      if (poll.ownVote && poll.votes) {
        // eslint-disable-next-line eqeqeq
        votes = poll.votes.filter(id => id != poll.ownVote);
      }
      const newOptions = [];
      const { options } = state[vote.pollId];
      for (let i = 0; i < options.length; i += 1) {
        const option = options[i];
        if (option.pos === index) {
          newOptions.push({
            ...option,
            numVotes: option.numVotes - 1,
          });
        } else {
          newOptions.push({ ...option });
        }
      }

      return {
        ...state,
        [vote.pollId]: {
          ...state[vote.pollId],
          ownVote: null,
          ownStatement: null,
          options: newOptions,
          statements,
          votes,
        },
      };
    }
    case CREATE_STATEMENT_SUCCESS: {
      const statement =
        action.payload.entities.statements[action.payload.result];
      return {
        ...state,
        [statement.pollId]: {
          ...state[statement.pollId],
          ownStatement: statement.id,
        },
      };
    }
    case DELETE_STATEMENT_SUCCESS: {
      const statement =
        action.payload.entities.statements[action.payload.result];
      return {
        ...state,
        [statement.pollId]: {
          ...state[statement.pollId],
          ownStatement: null,
          statements: state[statement.pollId].statements.filter(
            // eslint-disable-next-line eqeqeq
            id => id != statement.id,
          ),
        },
      };
    }

    case CREATE_LIKE_SUCCESS: {
      let likedStatements = state[action.pollId].likedStatements || [];
      likedStatements = [...likedStatements, action.payload.result];
      return {
        ...state,
        [action.pollId]: { ...state[action.pollId], likedStatements },
      };
    }

    case DELETE_LIKE_SUCCESS: {
      let likedStatements = state[action.pollId].likedStatements || [];
      likedStatements = likedStatements.filter(
        // eslint-disable-next-line eqeqeq
        id => id != action.payload.result,
      );
      return {
        ...state,
        [action.pollId]: { ...state[action.pollId], likedStatements },
      };
    }

    default:
      return state;
  }
}
