import { SET_COOKIE_CONSENT } from '../constants';

const consent = (state = null, action) => {
  switch (action.type) {
    case SET_COOKIE_CONSENT: {
      return 'YES';
    }
    default: {
      return state;
    }
  }
};

export default consent;
