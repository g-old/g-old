/* eslint-disable import/prefer-default-export */

import { genStatusIndicators } from '../core/helpers';
import { getSessionUser } from '../reducers';

import { CREATE_VEMAIL_START, CREATE_VEMAIL_SUCCESS, CREATE_VEMAIL_ERROR } from '../constants';

export function verifyEmail() {
  return async (dispatch, getState, { fetch }) => {
    const properties = genStatusIndicators(['verifyEmail']);
    const state = await getState();
    const user = getSessionUser(state);
    dispatch({
      type: CREATE_VEMAIL_START,
      properties,
      id: user.id,
    });
    try {
      const resp = await fetch('/verify', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (resp.status !== 200) throw new Error(resp.statusText);
      dispatch({
        type: CREATE_VEMAIL_SUCCESS,
        properties,
        id: user.id,
      });
    } catch (error) {
      dispatch({
        type: CREATE_VEMAIL_ERROR,
        payload: { error },
        properties,
        message: error.message || 'Something went wrong',
        id: user.id,
      });
    }

    return true;
  };
}
