import { SSE_UPDATE_SUCCESS, RESET_ACTIVITY_COUNTER } from '../../constants';

const activityCounter = (state = { proposals: 0, feed: 0 }, action) => {
  switch (action.type) {
    case SSE_UPDATE_SUCCESS: {
      const activity = action.payload.entities.activities[action.payload.result];
      if (activity.type === 'proposal') {
        return { ...state, proposals: state.proposals + 1 };
      }
      return { proposals: state.proposals, feed: state.feed + 1 };
    }
    case RESET_ACTIVITY_COUNTER: {
      return action.payload.feed ? { ...state, feed: 0 } : { ...state, proposals: 0 };
    }

    default:
      return state;
  }
};

export default activityCounter;
export const getCounter = state => state;
