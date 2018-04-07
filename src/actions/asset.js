/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_ASSET_START,
  CREATE_ASSET_SUCCESS,
  CREATE_ASSET_ERROR,
  UPDATE_ASSET_START,
  UPDATE_ASSET_SUCCESS,
  UPDATE_ASSET_ERROR,
  DELETE_ASSET_START,
  DELETE_ASSET_SUCCESS,
  DELETE_ASSET_ERROR,
  LOAD_ASSETS_START,
  LOAD_ASSETS_SUCCESS,
  LOAD_ASSETS_ERROR,
} from '../constants';
import {
  asset as assetSchema,
  assetList as assetListSchema,
} from '../store/schema';
import { genStatusIndicators } from '../core/helpers';

const assetFields = `
id
`;

/*
const createAssetMutation = `
  mutation ($asset:AssetInput) {
    createAsset (asset:$asset){
      ${assetFields}
    }
  }
`;
*/
const updateAssetMutation = `
  mutation ($asset:AssetInput) {
    updateAsset (asset:$asset){
      ${assetFields}
    }
  }
`;

const deleteAssetMutation = `
  mutation ($asset:AssetInput) {
    deleteAsset (asset:$asset){
      ${assetFields}
    }
  }
`;

const assetConnection = `
query ($first:Int $after:String) {
  assetConnection (first:$first after:$after) {
    pageInfo{
      endCursor
      hasNextPage
    }
    edges{
      node{
    ${assetFields}
      }
    }
  }
}
`;

export function createAsset(data, params) {
  const initialId = '0000';
  return async (dispatch, getState, { fetch }) => {
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
      type: CREATE_ASSET_START,
      id: initialId,
    });

    try {
      const resp = await fetch('/upload', {
        method: 'post',
        body: formData,
        credentials: 'include',
      });
      if (resp.status !== 200) throw new Error(resp.statusText);
      const uploadedData = await resp.json();
      const normalizedData = normalize(uploadedData.result, assetListSchema);

      dispatch({
        type: CREATE_ASSET_SUCCESS,
        payload: normalizedData,
        id: initialId,
      });
      /*  dispatch({
        type: UPLOAD_AVATAR_SUCCESS,
        payload: { user },
      }); */
    } catch (error) {
      dispatch({
        type: CREATE_ASSET_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: initialId,
      });
      return false;
    }

    return true;
  };
}

export function updateAsset(asset) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['updateasset']);
    dispatch({
      type: UPDATE_ASSET_START,
      id: asset.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updateAssetMutation, { asset });
      const normalizedData = normalize(data.updateAsset, assetSchema);
      dispatch({
        type: UPDATE_ASSET_SUCCESS,
        payload: normalizedData,
        properties,
        id: asset.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_ASSET_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: asset.id,
        asset,
      });
      return false;
    }

    return true;
  };
}

export function deleteAsset(asset) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deleteAsset']);
    dispatch({
      type: DELETE_ASSET_START,
      id: asset.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deleteAssetMutation, { asset });
      const normalizedData = normalize(data.deleteAsset, assetSchema);
      dispatch({
        type: DELETE_ASSET_SUCCESS,
        payload: normalizedData,
        properties,
        id: asset.id,
      });
    } catch (error) {
      dispatch({
        type: DELETE_ASSET_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: asset.id,
        properties,
        asset: { delete: true },
      });
      return false;
    }

    return true;
  };
}

export function loadAssetList({ first, after }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_ASSETS_START,
    });

    try {
      const { data } = await graphqlRequest(assetConnection, {
        first,
        after,
      });
      const assets = data.assetConnection.edges.map(u => u.node);
      const normalizedData = normalize(assets, assetListSchema);
      dispatch({
        type: LOAD_ASSETS_SUCCESS,
        payload: normalizedData,
        pagination: data.assetConnection.pageInfo,
        savePageInfo: after != null,
      });
    } catch (error) {
      dispatch({
        type: LOAD_ASSETS_ERROR,
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
