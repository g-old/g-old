import { SSE_UPDATE_SUCCESS, RESET_ACTIVITY_COUNTER } from '../../constants';

const activityCounter = (state = { feed: 0 }, action) => {
  switch (action.type) {
    case SSE_UPDATE_SUCCESS: {
      const activity =
        action.payload.entities.activities[action.payload.result];
      // eslint-disable-next-line eqeqeq
      if (activity.actor == action.userId) return state;
      return { feed: state.feed + 1 };
    }
    case RESET_ACTIVITY_COUNTER: {
      return { ...state, feed: 0 };
    }

    default:
      return state;
  }
};

export default activityCounter;
export const getCounter = state => state;
