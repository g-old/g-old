/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_TAG_START,
  CREATE_TAG_SUCCESS,
  CREATE_TAG_ERROR,
  UPDATE_TAG_START,
  UPDATE_TAG_SUCCESS,
  UPDATE_TAG_ERROR,
  DELETE_TAG_START,
  DELETE_TAG_SUCCESS,
  DELETE_TAG_ERROR,
} from '../constants';
import { tag as tagSchema } from '../store/schema';
import { genStatusIndicators } from '../core/helpers';

const tagFields = `
id
deName
itName
lldName
text
count
`;

const createTagMutation = `
  mutation ($tag:TagInput) {
    createTag (tag:$tag){
      ${tagFields}
    }
  }
`;

const updateTagMutation = `
  mutation ($tag:TagInput) {
    updateTag (tag:$tag){
      ${tagFields}
    }
  }
`;

const deleteTagMutation = `
  mutation ($tag:TagInput) {
    deleteTag (tag:$tag){
      ${tagFields}
    }
  }
`;

export function createTag(tag) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = '0000';
    const properties = genStatusIndicators(['createTag']);
    dispatch({
      type: CREATE_TAG_START,
      id: virtualId,
      properties,
    });
    try {
      const { data } = await graphqlRequest(createTagMutation, { tag });
      const normalizedData = normalize(data.createTag, tagSchema);
      dispatch({
        type: CREATE_TAG_SUCCESS,
        payload: normalizedData,
        id: virtualId,
        properties,
        tag,
      });
    } catch (error) {
      dispatch({
        type: CREATE_TAG_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
        tag,
        properties,
      });
      return false;
    }

    return true;
  };
}

export function updateTag(tag) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['updatetag']);
    dispatch({
      type: UPDATE_TAG_START,
      id: tag.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updateTagMutation, { tag });
      const normalizedData = normalize(data.updateTag, tagSchema);
      dispatch({
        type: UPDATE_TAG_SUCCESS,
        payload: normalizedData,
        properties,
        id: tag.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_TAG_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: tag.id,
        tag,
      });
      return false;
    }

    return true;
  };
}

export function deleteTag(tag) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deleteTag']);
    dispatch({
      type: DELETE_TAG_START,
      id: tag.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deleteTagMutation, { tag });
      const normalizedData = normalize(data.deleteTag, tagSchema);
      dispatch({
        type: DELETE_TAG_SUCCESS,
        payload: normalizedData,
        properties,
        id: tag.id,
      });
    } catch (error) {
      dispatch({
        type: DELETE_TAG_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: tag.id,
        properties,
        tag: { delete: true },
      });
      return false;
    }

    return true;
  };
}
