import { SCROLL_TO_RESOURCE } from '../constants';

const scrollToCounter = (state = { counter: 0 }, action) => {
  switch (action.type) {
    case SCROLL_TO_RESOURCE: {
      return {
        counter: state.counter + 1,
        ...action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default scrollToCounter;
