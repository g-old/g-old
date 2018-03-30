/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import { user as userSchema } from '../store/schema';

import {
  SESSION_LOGOUT_START,
  SESSION_LOGOUT_SUCCESS,
  SESSION_LOGOUT_ERROR,
  SESSION_LOGIN_START,
  SESSION_LOGIN_SUCCESS,
  SESSION_LOGIN_ERROR,
  SET_COOKIE_CONSENT,
} from '../constants';

import { createSSESub, closeSSE } from './sseSubs';
import { locales } from './intl';

// import fetch from '../core/fetch';

export function allowCookies() {
  return async dispatch => {
    dispatch({ type: SET_COOKIE_CONSENT, payload: true });
    if (process.env.BROWSER) {
      const maxAge = 3650 * 24 * 3600; // 10 years in seconds
      document.cookie = `consent=YES;path=/;max-age=${maxAge}`;
    }
  };
}

export function logout() {
  return async (dispatch, getState, { fetch, history }) => {
    const { user } = getState();
    dispatch({
      type: SESSION_LOGOUT_START,
      payload: {
        user,
      },
    });
    dispatch(closeSSE());
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

export function login(data) {
  return async (dispatch, getState, { fetch, history }) => {
    const initialId = '0000';
    const properties = ['login'].reduce((acc, curr) => {
      // eslint-disable-next-line no-param-reassign
      acc[curr] = {
        pending: true,
        success: false,
        error: null,
      };
      return acc;
    }, {});
    let redirect = null;
    if (
      history.location.search &&
      history.location.search.indexOf('=') !== -1
    ) {
      const newPath = history.location.search.split('=')[1];

      // don't redirect on language selection
      if (!locales[newPath]) redirect = newPath;
    }
    dispatch({
      type: SESSION_LOGIN_START,
      properties,
      id: initialId,
    });

    try {
      const resp = await fetch('/login', {
        body: JSON.stringify(data),
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const { user } = await resp.json();
      const normalizedData = normalize(user, userSchema);
      if (user) {
        dispatch({
          type: SESSION_LOGIN_SUCCESS,
          payload: normalizedData,
          properties,
          id: initialId,
        });
      }

      dispatch(createSSESub());

      history.push(redirect || '/feed');
    } catch (error) {
      dispatch({
        type: SESSION_LOGIN_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: initialId,
      });
      return false;
    }

    return true;
  };
}
