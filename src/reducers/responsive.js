import { SET_SIZE_VARIABLE } from '../constants';

export default function layoutSize(state = {}, action) {
  switch (action.type) {
    case SET_SIZE_VARIABLE:
      return {
        small: action.payload.value,
      };
    default:
      return state;
  }
}

export const getLayoutSize = state => state.small;
