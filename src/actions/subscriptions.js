/* eslint-disable import/prefer-default-export */
import { urlBase64ToUint8Array } from '../core/helpers';
import {
  CREATE_PSUB_START,
  CREATE_PSUB_SUCCESS,
  CREATE_PSUB_ERROR,
  DELETE_PSUB_START,
  DELETE_PSUB_SUCCESS,
  DELETE_PSUB_ERROR,
  CHECK_PSUB_STATUS,
} from '../constants';
import { getSessionUser } from '../reducers';
import config from '../../private_configs';

const createPushSub = `mutation($endpoint:String! $p256dh:String! $auth:String!){
createPushSub(subscription:{endpoint:$endpoint p256dh:$p256dh auth:$auth})
}`;

const deletePushSub = `mutation($endpoint:String! $p256dh:String! $auth:String!){
deletePushSub(subscription:{endpoint:$endpoint p256dh:$p256dh auth:$auth})
}`;

const registerSW = async (file) => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.register(file);
    const serviceWorker = registration.installing || registration.waiting || registration.active;

    return new Promise((resolve, reject) => {
      if (!serviceWorker) {
        reject('No serviceWorker in registration');
        return;
      }
      if (serviceWorker.state === 'activated') {
        resolve(registration);
      }
      if (serviceWorker.state === 'redundant') {
        reject('SW registration is redundant!');
      }
      const changeListener = () => {
        if (serviceWorker.state === 'activated') {
          resolve(registration);
        } else if (serviceWorker.state === 'redundant') {
          reject('SW registration is redundant!');
        }
        serviceWorker.removeEventListener('statechange', changeListener);
      };
      serviceWorker.addEventListener('statechange', changeListener);
    });
  }
  return null;
};

const subscriptionToObject = (subscription) => {
  const sub = JSON.parse(JSON.stringify(subscription));
  if (!sub) throw Error('Could not parse subscription');
  return {
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  };
};

const getPushSubscription = async () => {
  const registration = await registerSW('serviceworker.js');
  if (!registration) {
    throw Error('Could not register SW');
  }
  // TODO older versions have cb!
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw Error('Permission denied');
  }
  const publicKey = config.webpush.publicKey;
  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  };
  const subscription = await registration.pushManager.subscribe(subscribeOptions);
  if (!subscription) throw Error('Could not subscribe to push service');

  return subscriptionToObject(subscription);
};

const deletePushSubscription = async () => {
  const result = {};
  const registration = await navigator.serviceWorker.ready;
  if (!registration) {
    throw Error('SW not registered');
  }
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    result.subscription = subscriptionToObject(subscription);
    result.status = await subscription.unsubscribe();
    const unregistered = await registration.unregister();
    if (!unregistered) {
      console.error('Could not unregister SW');
    }
  }

  return result;
};

export function createWebPushSub() {
  return async (dispatch, getState, { graphqlRequest }) => {
    // eslint-disable-next-line no-unused-vars

    const user = getSessionUser(getState());
    if (!user) throw Error('User not logged in');
    dispatch({
      type: CREATE_PSUB_START,
      id: user.id,
      payload: { pending: true, error: null },
    });

    try {
      const subscription = await getPushSubscription();
      const { data } = await graphqlRequest(createPushSub, subscription);
      const result = data.createPushSub;
      if (result) {
        dispatch({
          type: CREATE_PSUB_SUCCESS,
          payload: { pending: false, isPushEnabled: result, error: null },
          id: user.id,
        });
      } else {
        throw Error('Subscription could not been stored');
      }
    } catch (error) {
      let msg = error.message;
      if (Notification.permission === 'denied') {
        msg = 'User denied permission';
      }
      console.error('Subscription failed', error);
      dispatch({
        type: CREATE_PSUB_ERROR,
        payload: {
          error: msg || 'Something went wrong',
          pending: false,
        },
        id: user.id,
      });
      return false;
    }

    return true;
  };
}

export function deleteWebPushSub() {
  return async (dispatch, getState, { graphqlRequest }) => {
    // eslint-disable-next-line no-unused-vars

    const user = getSessionUser(getState());
    if (!user) throw Error('User not logged in');
    dispatch({
      type: DELETE_PSUB_START,
      id: user.id,
      payload: { pending: true, error: null },
    });

    try {
      const deleted = await deletePushSubscription();
      if (!deleted || !deleted.status) throw Error('Unsubscribing failed');
      const { data } = await graphqlRequest(deletePushSub, deleted.subscription);
      const result = data.deletePushSub;
      if (result) {
        dispatch({
          type: DELETE_PSUB_SUCCESS,
          payload: { pending: false, isPushEnabled: false, error: null },
          id: user.id,
        });
      } else {
        // throw Error('Subscription could not been deleted');
        console.error('Subscription data could not been deleted ');
        // push service should notify backend and deletion attempt will be repeated
      }
    } catch (error) {
      dispatch({
        type: DELETE_PSUB_ERROR,
        payload: {
          pending: false,
          error: error.message || 'Something went wrong',
        },
        id: user.id,
      });
      return false;
    }

    return true;
  };
}

export function checkSubscription() {
  return async (dispatch, getState) => {
    // eslint-disable-next-line no-unused-vars
    let isPushEnabled = false;
    let error = null;
    let disabled = true;
    const user = getSessionUser(getState());
    if (!user) throw Error('User not logged in');
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      if (Notification.permission === 'denied') {
        error = 'User has blocked subscription';
      } else {
        disabled = false;

        const controller = await navigator.serviceWorker.controller;

        if (controller) {
          try {
            const registration = await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
              isPushEnabled = false;
            } else {
              isPushEnabled = true;
            }
          } catch (e) {
            console.error('Could not get subscription', e);
            error = 'Could not get subscription';
          }
        }
      }
    }
    dispatch({
      type: CHECK_PSUB_STATUS,
      id: user.id,
      payload: { isPushEnabled, error, disabled },
    });
  };
}
