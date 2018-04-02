/* eslint-disable import/prefer-default-export */

import { normalize } from 'normalizr';
import {
  CREATE_SUBSCRIPTION_START,
  CREATE_SUBSCRIPTION_SUCCESS,
  CREATE_SUBSCRIPTION_ERROR,
  UPDATE_SUBSCRIPTION_START,
  UPDATE_SUBSCRIPTION_SUCCESS,
  UPDATE_SUBSCRIPTION_ERROR,
  DELETE_SUBSCRIPTION_START,
  DELETE_SUBSCRIPTION_SUCCESS,
  DELETE_SUBSCRIPTION_ERROR,
  LOAD_SUBSCRIPTIONS_START,
  LOAD_SUBSCRIPTIONS_SUCCESS,
  LOAD_SUBSCRIPTIONS_ERROR,
} from '../constants';
import {
  subscription as subscriptionSchema,
  subscriptionList as subscriptionListSchema,
} from '../store/schema';
import { genStatusIndicators } from '../core/helpers';

const subscriptionFields = `
id
`;

const createSubscriptionMutation = `
  mutation ($subscription:SubscriptionInput) {
    createSubscription (subscription:$subscription){
      ${subscriptionFields}
    }
  }
`;

const updateSubscriptionMutation = `
  mutation ($subscription:SubscriptionInput) {
    updateSubscription (subscription:$subscription){
      ${subscriptionFields}
    }
  }
`;

const deleteSubscriptionMutation = `
  mutation ($subscription:SubscriptionInput) {
    deleteSubscription (subscription:$subscription){
      ${subscriptionFields}
    }
  }
`;

const subscriptionConnection = `
query ($first:Int $after:String) {
  subscriptionConnection (first:$first after:$after) {
    pageInfo{
      endCursor
      hasNextPage
    }
    edges{
      node{
    ${subscriptionFields}
      }
    }
  }
}
`;

export function createSubscription(subscription) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = '0000';
    dispatch({
      type: CREATE_SUBSCRIPTION_START,
      id: virtualId,
    });
    try {
      const { data } = await graphqlRequest(createSubscriptionMutation, {
        subscription,
      });
      const normalizedData = normalize(
        data.createSubscription,
        subscriptionSchema,
      );
      dispatch({
        type: CREATE_SUBSCRIPTION_SUCCESS,
        payload: normalizedData,
        id: virtualId,
        subscription,
      });
    } catch (error) {
      dispatch({
        type: CREATE_SUBSCRIPTION_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: virtualId,
        subscription,
      });
      return false;
    }

    return true;
  };
}

export function updateSubscription(subscription) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['updatesubscription']);
    dispatch({
      type: UPDATE_SUBSCRIPTION_START,
      id: subscription.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(updateSubscriptionMutation, {
        subscription,
      });
      const normalizedData = normalize(
        data.updateSubscription,
        subscriptionSchema,
      );
      dispatch({
        type: UPDATE_SUBSCRIPTION_SUCCESS,
        payload: normalizedData,
        properties,
        id: subscription.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_SUBSCRIPTION_ERROR,
        payload: {
          error,
        },
        properties,
        message: error.message || 'Something went wrong',
        id: subscription.id,
        subscription,
      });
      return false;
    }

    return true;
  };
}

export function deleteSubscription(subscription) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const properties = genStatusIndicators(['deleteSubscription']);
    dispatch({
      type: DELETE_SUBSCRIPTION_START,
      id: subscription.id,
      properties,
    });
    try {
      const { data } = await graphqlRequest(deleteSubscriptionMutation, {
        subscription,
      });
      const normalizedData = normalize(
        data.deleteSubscription,
        subscriptionSchema,
      );
      dispatch({
        type: DELETE_SUBSCRIPTION_SUCCESS,
        payload: normalizedData,
        properties,
        id: subscription.id,
      });
    } catch (error) {
      dispatch({
        type: DELETE_SUBSCRIPTION_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: subscription.id,
        properties,
        subscription: { delete: true },
      });
      return false;
    }

    return true;
  };
}

export function loadSubscriptionList({ first, after }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_SUBSCRIPTIONS_START,
    });

    try {
      const { data } = await graphqlRequest(subscriptionConnection, {
        first,
        after,
      });
      const subscriptions = data.subscriptionConnection.edges.map(u => u.node);
      const normalizedData = normalize(subscriptions, subscriptionListSchema);
      dispatch({
        type: LOAD_SUBSCRIPTIONS_SUCCESS,
        payload: normalizedData,
        pagination: data.subscriptionConnection.pageInfo,
        savePageInfo: after != null,
      });
    } catch (error) {
      dispatch({
        type: LOAD_SUBSCRIPTIONS_ERROR,
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
