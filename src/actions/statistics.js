/* eslint-disable import/prefer-default-export */

import {
  LOAD_STATISTICS_START,
  LOAD_STATISTICS_ERROR,
  LOAD_STATISTICS_SUCCESS,
} from '../constants';

const statisticsQuery = `
query{
  statistics {
    usersOnline
    bucket {
      objects {
        usage
        limit
        usedPercent
      }
      storage {
        usage
        limit
        usedPercent
      }
      bandwidth {
        usage
        limit
        usedPercent
      }
      requests
    }
    server {
      numCpus
      uptime
      loadAvg
      memory
    }
    db {
      size
      cacheHitRate
      indexUsage {
        table
        indexUsage
        numRows
      }
    }
  }
}
`;

export function loadStatistics() {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!
    dispatch({
      type: LOAD_STATISTICS_START,
    });

    try {
      const { data } = await graphqlRequest(statisticsQuery);
      dispatch({
        type: LOAD_STATISTICS_SUCCESS,
        payload: data.statistics,
      });
    } catch (error) {
      dispatch({
        type: LOAD_STATISTICS_ERROR,
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
