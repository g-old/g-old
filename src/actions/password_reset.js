/* eslint-disable import/prefer-default-export */

import { RESET_PASSWORD_START, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_ERROR } from '../constants';

export function recoverPassword(email) {
  return async dispatch => {
    dispatch({
      type: RESET_PASSWORD_START,
    });
    try {
      await fetch('/forgot', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
        credentials: 'include',
      });
    } catch (error) {
      return false;
    }

    return true;
  };
}

export function resetPassword({ token, password }) {
  return async dispatch => {
    try {
      const resp = await fetch(`/reset/${token}`, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
        credentials: 'include',
      });
      if (resp.status !== 200) throw new Error(resp.statusText);
      const { user } = await resp.json();
      if (!user) throw Error('Resetting failed');
      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        payload: { user },
      });
    } catch (error) {
      dispatch({
        type: RESET_PASSWORD_ERROR,
        payload: { error },
      });
    }

    return true;
  };
}
