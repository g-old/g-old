/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_PLATTFORM_START,
  CREATE_PLATTFORM_SUCCESS,
  CREATE_PLATTFORM_ERROR,
  UPDATE_PLATTFORM_START,
  UPDATE_PLATTFORM_SUCCESS,
  UPDATE_PLATTFORM_ERROR,
  DELETE_PLATTFORM_START,
  DELETE_PLATTFORM_SUCCESS,
  DELETE_PLATTFORM_ERROR,
  LOAD_PLATTFORM_START,
  LOAD_PLATTFORM_ERROR,
  LOAD_PLATTFORM_SUCCESS,
} from '../constants';
import { plattform as plattformSchema } from '../store/schema';
import { genStatusIndicators } from '../core/helpers';

const plattformFields = `
  displayName
  picture
  defaultGroup{
      id
      displayName
      picture
    }
`;

const plattformQuery = `
query{
  plattform{
    ${plattformFields}
  }
}`;

const plattformQueryWithDetails = `
query{
  plattform{
    ${plattformFields}
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

const createPlattformMutation = `
  mutation ($plattform:PlattformInput) {
    createPlattform (plattform:$plattform){
          ${plattformFields}
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

const updatePlattformMutation = `
  mutation ($plattform:PlattformInput) {
    updatePlattform (plattform:$plattform){
          ${plattformFields}
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

const deletePlattformMutation = `
  mutation ($plattform:PlattformInput) {
    deletePlattform (plattform:$plattform){
          ${plattformFields}
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
  const normalized = normalize({ id: 'plattform', ...data }, plattformSchema);

  const { plattform } = normalized.entities.plattform;
  if (plattform.names) {
    plattform.names = JSON.parse(plattform.names);
  }
  delete plattform.id;
  normalized.entities.plattform = plattform;

  return normalized;
};

export function loadPlattform(withDetails) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_PLATTFORM_START,
    });
    try {
      const { data } = await graphqlRequest(
        withDetails ? plattformQueryWithDetails : plattformQuery,
      );
      const normalizedData = normalizeSettings(data.plattform);
      dispatch({
        type: LOAD_PLATTFORM_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: LOAD_PLATTFORM_ERROR,
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

export function createPlattform(plattform) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = '0000';
    const properties = genStatusIndicators(['createPlattform']);
    dispatch({
      type: CREATE_PLATTFORM_START,
      id: virtualId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createPlattformMutation, {
        plattform,
      });

      const normalizedData = normalize(data.createPlattform, plattformSchema);
      dispatch({
        type: CREATE_PLATTFORM_SUCCESS,
        payload: normalizedData,
        id: virtualId,
        properties,
        plattform,
      });
    } catch (error) {
      dispatch({
        type: CREATE_PLATTFORM_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
        plattform,
        properties,
      });
      return false;
    }

    return true;
  };
}

export function updatePlattform(plattform) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['updateplattform']);
    dispatch({
      type: UPDATE_PLATTFORM_START,
      id: plattform.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updatePlattformMutation, {
        plattform,
      });
      const normalizedData = normalizeSettings(data.updatePlattform);
      dispatch({
        type: UPDATE_PLATTFORM_SUCCESS,
        payload: normalizedData,
        properties,
        id: plattform.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_PLATTFORM_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: plattform.id,
        plattform,
      });
      return false;
    }

    return true;
  };
}

export function deletePlattform(plattform) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deletePlattform']);
    dispatch({
      type: DELETE_PLATTFORM_START,
      id: plattform.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deletePlattformMutation, {
        plattform,
      });
      const normalizedData = normalize(data.deletePlattform, plattformSchema);
      dispatch({
        type: DELETE_PLATTFORM_SUCCESS,
        payload: normalizedData,
        properties,
        id: plattform.id,
      });
    } catch (error) {
      dispatch({
        type: DELETE_PLATTFORM_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: plattform.id,
        properties,
        plattform: { delete: true },
      });
      return false;
    }

    return true;
  };
}
