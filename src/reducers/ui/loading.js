import { LOADING_START, LOADING_SUCCESS } from '../../constants';

export default (state = false, action) => {
  switch (action.type) {
    case LOADING_START:
      return true;
    case LOADING_SUCCESS:
      return false;

    default:
      return state;
  }
};
