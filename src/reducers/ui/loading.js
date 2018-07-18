import { LOADING_START, LOADING_SUCCESS } from '../../constants';

export default (state = { status: false, path: '/' }, action) => {
  switch (action.type) {
    case LOADING_START:
      return { status: true, path: action.payload };
    case LOADING_SUCCESS:
      return { ...state, status: false };

    default:
      return state;
  }
};
