/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_PLATFORM_START,
  CREATE_PLATFORM_SUCCESS,
  CREATE_PLATFORM_ERROR,
  UPDATE_PLATFORM_START,
  UPDATE_PLATFORM_SUCCESS,
  UPDATE_PLATFORM_ERROR,
  DELETE_PLATFORM_START,
  DELETE_PLATFORM_SUCCESS,
  DELETE_PLATFORM_ERROR,
  LOAD_PLATFORM_START,
  LOAD_PLATFORM_ERROR,
  LOAD_PLATFORM_SUCCESS,
} from '../constants';
import { platform as platformSchema } from '../store/schema';
import { genStatusIndicators } from '../core/helpers';

const platformFields = `
  displayName
  picture
  defaultGroup{
      id
      displayName
      picture
    }
`;

const platformQuery = `
query{
  platform{
    ${platformFields}
  }
}`;

const platformQueryWithDetails = `
query{
  platform{
    ${platformFields}
    names,
    admin{
      id
      name
      surname
      thumbnail
    }
    defaultGroup{
      id
      displayName
    }
    mainGroups{
      id
      displayName
    }
    email
  }
}
`;

const createPlatformMutation = `
  mutation ($platform:PlatformInput) {
    createPlatform (platform:$platform){
          ${platformFields}
    names,
    admin{
      id
      name
      surname
      thumbnail
    }
    }
  }
`;

const updatePlatformMutation = `
  mutation ($platform:PlatformInput) {
    updatePlatform (platform:$platform){
          ${platformFields}
    names,
    admin{
      id
      name
      surname
      thumbnail
    }
    }
  }
`;

const deletePlatformMutation = `
  mutation ($platform:PlatformInput) {
    deletePlatform (platform:$platform){
          ${platformFields}
    names,
    admin{
      id
      name
      surname
      thumbnail
    }
    }
  }
`;

const normalizeSettings = data => {
  const normalized = normalize({ id: 'platform', ...data }, platformSchema);

  const { platform } = normalized.entities.platform;
  if (platform.names) {
    platform.names = JSON.parse(platform.names);
  }
  delete platform.id;
  normalized.entities.platform = platform;

  return normalized;
};

export function loadPlatform(withDetails) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_PLATFORM_START,
    });
    try {
      const { data } = await graphqlRequest(
        withDetails ? platformQueryWithDetails : platformQuery,
      );
      const normalizedData = normalizeSettings(data.platform);
      dispatch({
        type: LOAD_PLATFORM_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_PLATFORM_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}

export function createPlatform(platform) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = '0000';
    const properties = genStatusIndicators(['createPlatform']);
    dispatch({
      type: CREATE_PLATFORM_START,
      id: virtualId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createPlatformMutation, {
        platform,
      });

      const normalizedData = normalize(data.createPlatform, platformSchema);
      dispatch({
        type: CREATE_PLATFORM_SUCCESS,
        payload: normalizedData,
        id: virtualId,
        properties,
        platform,
      });
    } catch (error) {
      dispatch({
        type: CREATE_PLATFORM_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
        platform,
        properties,
      });
      return false;
    }

    return true;
  };
}

export function updatePlatform(platform) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['updateplatform']);
    dispatch({
      type: UPDATE_PLATFORM_START,
      id: platform.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updatePlatformMutation, {
        platform,
      });
      const normalizedData = normalizeSettings(data.updatePlatform);
      dispatch({
        type: UPDATE_PLATFORM_SUCCESS,
        payload: normalizedData,
        properties,
        id: platform.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_PLATFORM_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: platform.id,
        platform,
      });
      return false;
    }

    return true;
  };
}

export function deletePlatform(platform) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deletePlatform']);
    dispatch({
      type: DELETE_PLATFORM_START,
      id: platform.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deletePlatformMutation, {
        platform,
      });
      const normalizedData = normalize(data.deletePlatform, platformSchema);
      dispatch({
        type: DELETE_PLATFORM_SUCCESS,
        payload: normalizedData,
        properties,
        id: platform.id,
      });
    } catch (error) {
      dispatch({
        type: DELETE_PLATFORM_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: platform.id,
        properties,
        platform: { delete: true },
      });
      return false;
    }

    return true;
  };
}
