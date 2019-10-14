/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';

import { user as userSchema } from '../store/schema';
// import fetch from '../core/fetch';
import {
  UPLOAD_AVATAR_START,
  UPLOAD_AVATAR_SUCCESS,
  UPLOAD_AVATAR_ERROR,
  UPLOAD_FILE_START,
  UPLOAD_FILE_SUCCESS,
  UPLOAD_FILE_ERROR,
} from '../constants';

import { getUploadStatus } from '../reducers';

// only clientside!
export function uploadAvatar(data) {
  const initialId = data.id || '0000';
  return async (dispatch, getState, { fetch }) => {
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
      if (!user.avatar && !user.thumbnail)
        throw new Error('Avatar upload failed');
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

export function uploadFile(data) {
  const initialId = data.id || '0000';
  return async (dispatch, getState, { fetch }) => {
    const formData = new FormData();
    formData.append('image', data.dataUrl);
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
      if (!user.avatar && !user.thumbnail)
        throw new Error('Avatar upload failed');
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

// gallery fn
export function uploadFiles(data, params) {
  const initialId = '0000';
  return async (dispatch, getState, { fetch }) => {
    if (getUploadStatus(getState()).pending) {
      return false;
    }
    const formData = new FormData();
    let uploadData;
    if (data.constructor !== Array) {
      uploadData = [data];
    } else {
      uploadData = data;
    }

    uploadData.forEach(file => {
      formData.append('files', file);
    });

    formData.append('params', JSON.stringify(params));

    // eslint-disable-line
    dispatch({
      type: UPLOAD_FILE_START,
      id: initialId,
    });

    try {
      const resp = await fetch('/upload/files', {
        method: 'post',
        body: formData,
        credentials: 'include',
      });
      if (resp.status !== 200) throw new Error(resp.statusText);
      const responseData = await resp.json();
      // const normalizedData = normalize(uploadedData.result, imageList);
      const success =
        responseData.result &&
        responseData.result.length &&
        !!responseData.result[0];
      if (success) {
        dispatch({
          type: UPLOAD_FILE_SUCCESS,
          // payload: normalizedData,
          id: initialId,
        });
        return responseData.result[0];
      }
      dispatch({
        type: UPLOAD_FILE_ERROR,
        payload: {
          responseData,
        },
        message: 'Something went wrong',
        id: initialId,
      });
      return false;

      // only one filename is necessary
    } catch (error) {
      dispatch({
        type: UPLOAD_FILE_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: initialId,
      });
      return false;
    }
  };
}
