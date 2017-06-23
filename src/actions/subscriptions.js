/* eslint-disable import/prefer-default-export */
import { genStatusIndicators } from '../core/helpers';
import { CREATE_PSUB_START, CREATE_PSUB_SUCCESS, CREATE_PSUB_ERROR } from '../constants';
import { getSessionUser } from '../reducers';

const createPushSub = `mutation($endpoint:String! $p256dh:String! $auth:String!){
createPushSub(subscription:{endpoint:$endpoint p256dh:$p256dh auth:$auth})
}`;

export function saveWebPushSub(subscription) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // eslint-disable-next-line no-unused-vars

    const user = getSessionUser(getState());
    if (!user) throw Error('User not logged in');
    const properties = genStatusIndicators(['psub']);
    dispatch({
      type: CREATE_PSUB_START,
      id: user.id,
    });

    try {
      const { data } = await graphqlRequest(createPushSub, subscription);
      const result = data.createPushSub;
      if (result) {
        dispatch({
          type: CREATE_PSUB_SUCCESS,
          payload: result,
          properties,
          id: user.id,
        });
      } else {
        throw Error('Subscription could not been stored');
      }
    } catch (error) {
      dispatch({
        type: CREATE_PSUB_ERROR,
        payload: {
          error,
        },
        properties,
        id: user.id,
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}
