/* eslint-disable import/prefer-default-export */
import fetch from '../core/fetch';
import { UPLOAD_AVATAR_START, UPLOAD_AVATAR_SUCCESS, UPLOAD_AVATAR_ERROR } from '../constants';

// only clientside!
export function uploadAvatar(avatar) {
  return async dispatch => {
    const formData = new FormData();
    formData.append('avatar', avatar.dataUrl);
    dispatch({
      type: UPLOAD_AVATAR_START,
      payload: {
        avatar,
      },
    });

    try {
      const resp = await fetch('/upload', {
        method: 'post',
        body: formData, // JSON.stringify(avatar),
        credentials: 'include',
      });
      if (resp.status !== 200) throw new Error(resp.statusText);
      const user = await resp.json();
      if (!user.avatar) throw new Error('Avatar upload failed');
      dispatch({
        type: UPLOAD_AVATAR_SUCCESS,
        payload: { user },
      });
    } catch (error) {
      dispatch({
        type: UPLOAD_AVATAR_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}
