import merge from 'lodash.merge';

import { LOAD_FLAGGEDSTMTS_SUCCESS, UPDATE_FLAGGEDSTMT_SUCCESS } from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case UPDATE_FLAGGEDSTMT_SUCCESS:
    case LOAD_FLAGGEDSTMTS_SUCCESS: {
      return merge({}, state, action.payload.entities.flaggedStatements);
    }
    default:
      return state;
  }
}

export const getFlaggedStatement = (state, id) => state[id];
