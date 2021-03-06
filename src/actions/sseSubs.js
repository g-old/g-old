/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import {
  CREATE_SSESUB_START,
  CREATE_SSESUB_SUCCESS,
  CREATE_SSESUB_ERROR,
  SSE_UPDATE_SUCCESS,
} from '../constants';
import { activity as activitySchema } from '../store/schema';
import { getFilter } from '../core/helpers';
import { getSessionUser } from '../reducers';
import { canAccess } from '../organization';
import { activityFields } from './feed';

const activitiesSubscription = `
subscription{
  activities {
 ${activityFields}
 }
}
`;

let eventSource = null;
export function createSSESub() {
  return async (dispatch, getState, { fetch }) => {
    const user = getSessionUser(getState());
    // eslint-disable-next-line no-bitwise
    if (!canAccess(user, 'SSE')) {
      return false;
    }
    if (eventSource && eventSource.readyState !== 2) {
      // closed
      console.info('Already connected or connecting');
      return false;
    }

    if (!EventSource) {
      console.error('Browser does not support SSE');
      return false;
    }

    dispatch({
      type: CREATE_SSESUB_START,
    });
    try {
      const response = await fetch('/updates', {
        body: JSON.stringify({ query: activitiesSubscription }),
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      // returns subId,
      const resp = await response.json();
      if (resp.subId) {
        eventSource = new EventSource(`/updates/${resp.subId}`, {
          withCredentials: true,
        });
        eventSource.onmessage = e => {
          const message = JSON.parse(e.data);

          switch (message.type) {
            case 'DATA': {
              const normalizedData = normalize(
                message.data.activities,
                activitySchema,
              );
              let proposalFilter = null;
              if (message.data.activities.type === 'proposal') {
                proposalFilter = getFilter(
                  message.data.activities.object.state,
                );
              }
              dispatch({
                type: SSE_UPDATE_SUCCESS,
                payload: normalizedData,
                proposalFilter,
                filter: 'feed',
                userId: user.id,
              });
              break;
            }
            case 'KEEPALIVE':
              break;
            default:
              break;
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          if (getState().user) {
            setTimeout(() => {
              dispatch(createSSESub());
            }, 5000);
          }
        };

        dispatch({
          type: CREATE_SSESUB_SUCCESS,
        });
      } else {
        dispatch({
          type: CREATE_SSESUB_ERROR,
          payload: resp,
        });
      }
    } catch (e) {
      dispatch({
        type: CREATE_SSESUB_ERROR,
        payload: e,
      });
    }
    return true;
  };
}

export function closeSSE() {
  return async () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}
