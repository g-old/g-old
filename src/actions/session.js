/* eslint-disable import/prefer-default-export */
import { SESSION_LOGOUT_START, SESSION_LOGOUT_SUCCESS, SESSION_LOGOUT_ERROR } from '../constants';
import fetch from '../core/fetch';
import history from '../core/history';

export function logout() {
  return async (dispatch, getState) => {
    const user = getState().user;
    dispatch({
      type: SESSION_LOGOUT_START,
      payload: {
        user,
      },
    });
    try {
      const resp = await fetch('/logout', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const { redirect } = await resp.json();
      if (redirect) {
        console.log('REDIRECT', redirect);
        history.push(redirect);
        dispatch({
          type: SESSION_LOGOUT_SUCCESS,
          payload: redirect,
        });
      }
    } catch (error) {
      dispatch({
        type: SESSION_LOGOUT_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}
