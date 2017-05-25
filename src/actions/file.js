/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';

import { user as userSchema } from '../store/schema';
import fetch from '../core/fetch';
import { UPLOAD_AVATAR_START, UPLOAD_AVATAR_SUCCESS, UPLOAD_AVATAR_ERROR } from '../constants';

// only clientside!
export function uploadAvatar(data) {
  const initialId = data.id || '0000';
  return async (dispatch) => {
    const formData = new FormData();
    formData.append('avatar', data.dataUrl);
    if (data.id) {
      formData.append('id', data.id);
    }
    const { id, ...avatar } = data;
    const properties = Object.keys(avatar).reduce((acc, curr) => {
      // eslint-disable-next-line no-param-reassign
      acc[curr] = {
        pending: true,
        success: false,
        error: null,
      };
      return acc;
    }, {});
    dispatch({
      type: UPLOAD_AVATAR_START,
      id: initialId,
      properties,
    });

    try {
      const resp = await fetch('/upload', {
        method: 'post',
        body: formData, // JSON.stringify(avatar),
        credentials: 'include',
      });
      if (resp.status !== 200) throw new Error(resp.statusText);
      const user = await resp.json();
      if (user.message) throw new Error(user.message);
      if (!user.avatar) throw new Error('Avatar upload failed');
      const normalizedData = normalize(user, userSchema);
      dispatch({
        type: UPLOAD_AVATAR_SUCCESS,
        payload: normalizedData,
        id: initialId,
        properties,
      });
      /*  dispatch({
        type: UPLOAD_AVATAR_SUCCESS,
        payload: { user },
      }); */
    } catch (error) {
      dispatch({
        type: UPLOAD_AVATAR_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: initialId,
        properties,
      });
      return false;
    }

    return true;
  };
}
