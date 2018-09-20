/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  LOAD_LOGS_START,
  LOAD_LOGS_SUCCESS,
  LOAD_LOGS_ERROR,
} from '../constants';

import { logList as logsSchema } from '../store/schema';
import { getLogIsFetching, getSessionUser } from '../reducers';
import { objectFields } from './activity';
import { userFields } from './user';

const logs = `
query($userId:ID){
  logs (userId:$userId){
    id
    type
    objectId
    verb
    createdAt
    info
    actor{
      ${userFields}
    }
    object{
      ${objectFields}
    }
  }
}
`;
export function loadLogs() {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    const state = await getState();
    if (getLogIsFetching(state)) {
      return false;
    }

    const userId = getSessionUser(state).id;

    dispatch({
      type: LOAD_LOGS_START,
    });

    try {
      const { data } = await graphqlRequest(logs, { userId });

      const normalizedData = normalize(data.logs, logsSchema);

      dispatch({
        type: LOAD_LOGS_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_LOGS_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}
