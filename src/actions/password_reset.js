/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import { user as userSchema } from '../store/schema';
import { RESET_PASSWORD_START, RESET_PASSWORD_SUCCESS, RESET_PASSWORD_ERROR } from '../constants';

export function recoverPassword(email) {
  return async () => {
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

const initialId = 'pw';
export function resetPassword({ token, password }) {
  return async dispatch => {
    const properties = ['password'].reduce(
      (acc, curr) => {
        // eslint-disable-next-line no-param-reassign
        acc[curr] = {
          pending: true,
          success: false,
          error: null,
        };
        return acc;
      },
      {},
    );
    dispatch({
      type: RESET_PASSWORD_START,
      properties,
      id: initialId,
    });
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
      const normalizedData = normalize(user, userSchema);
      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        payload: normalizedData,
        properties,
        id: initialId,
      });
    } catch (error) {
      dispatch({
        type: RESET_PASSWORD_ERROR,
        payload: { error },
        properties,
        message: error.message || 'Something went wrong',
        id: initialId,
      });
    }

    return true;
  };
}
