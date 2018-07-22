/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import { genStatusIndicators, depaginate } from '../core/helpers';
import { user as userSchema, userList as userArray } from '../store/schema';

import {
  UPDATE_USER_START,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  CREATE_USER_START,
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,
  FIND_USER_SUCCESS,
  FIND_USER_ERROR,
  FETCH_USER_START,
  FETCH_USER_SUCCESS,
  FETCH_USER_ERROR,
  DELETE_USER_START,
  DELETE_USER_SUCCESS,
  DELETE_USER_ERROR,
} from '../constants';

export const userFields = `
  id,
  name,
  surname,
  thumbnail,
    `;

const messageFields = `
      id
      messageType
      subject
      createdAt
      sender{
        ${userFields}
      }
    `;
const messageQuery = `
query($id:ID!){
  user(id:$id){
    id
    messagesSent{
     ${messageFields}
    }
    messagesReceived{
     ${messageFields}
     numReplies

    }
  }
}`;
const userQuery = `
query ($id:ID!) {
  user (id:$id) {
    lastLogin
    createdAt
    emailVerified
    email
    numStatements
    numFollowers
    numLikes
    locale
    
    groups

  }
}
`;

const profileQuery = `
query ($id:ID!) {
  user (id:$id) {
    ${userFields}
  }
}
`;

const updateUserMutation = `
mutation($id:ID $name:String, $surname:String, $groups:Int, $email:String, $password:String, $passwordOld:String, $followee:ID, $notificationSettings:String $locale:String){
  updateUser ( user:{id:$id name:$name, surname:$surname, groups:$groups, email:$email, password:$password passwordOld:$passwordOld followee:$followee notificationSettings:$notificationSettings locale:$locale }){
    user{${userFields}
    groups
    locale
    email,
    emailVerified,
  }
  errors
  }
}
`;

const deleteUserMutation = `
mutation($id:ID){
  deleteUser(user:{id:$id}){
    user{${userFields}
    groups
  }
    errors

  }
}`;

const userSearch = `
query ($term:String) {
  searchUser (term:$term) {
  ${userFields}
  groups
  }
}
`;

const objectifySettings = userData => {
  if (userData && userData.notificationSettings) {
    // eslint-disable-next-line
    userData.notificationSettings = JSON.parse(userData.notificationSettings);
  }
  return userData;
};

const initialId = '0000';

export function createUser(newUser, responseCode = null) {
  return async dispatch => {
    const properties = genStatusIndicators(newUser);
    dispatch({
      type: CREATE_USER_START,
      properties,
      id: initialId,
    });
    try {
      const resp = await fetch('/signup', {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: newUser,
          responseCode,
        }),
        credentials: 'include',
      });
      const { error, user } = await resp.json();
      if (error) {
        dispatch({
          type: CREATE_USER_ERROR,
          payload: {
            error,
          },
          message: error || 'Something went wrong',
          properties,
          id: initialId,
        });
        return false;
      }
      const normalizedData = normalize(user, userSchema);
      dispatch({
        type: CREATE_USER_SUCCESS,
        payload: normalizedData,
        id: initialId,
        properties,
      });
    } catch (error) {
      dispatch({
        type: CREATE_USER_ERROR,
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

export function updateUser(user) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // eslint-disable-next-line no-unused-vars
    const { id, info, ...rest } = user;
    const properties = genStatusIndicators(rest);

    dispatch({
      type: UPDATE_USER_START,
      properties,
      id: user.id,
    });

    try {
      const { data } = await graphqlRequest(updateUserMutation, user);
      const { errors } = data.updateUser;
      if (errors.length) {
        // TODO rewrite error handling
        const standardError = errors.reduce((acc, curr) => {
          if (curr in properties) {
            acc[curr] = { [curr]: { [curr]: true } };
            return acc;
          }
          acc.err = curr;
          return acc;
        }, {});
        let message;
        if (standardError.err) {
          message = standardError.err;
        } else {
          message = { fields: standardError };
        }

        dispatch({
          type: UPDATE_USER_ERROR,
          payload: {
            errors,
          },
          message,
          properties,
          id: user.id,
        });
        return false;
      }

      const normalizedData = normalize(
        objectifySettings(data.updateUser.user),
        userSchema,
      );
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: normalizedData,
        properties,
        info,
        id: user.id,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_USER_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        properties,
        id: user.id,
      });
      return false;
    }

    return true;
  };
}

export function findUser(term) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // eslint-disable-next-line no-unused-vars
    /*
    dispatch({
      type: FIND_USER_START,
    });
*/
    try {
      const { data } = await graphqlRequest(userSearch, term);
      const normalizedData = normalize(data.searchUser, userArray);
      dispatch({
        type: FIND_USER_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: FIND_USER_ERROR,
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

export function fetchUser({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // eslint-disable-next-line no-unused-vars

    dispatch({
      type: FETCH_USER_START,
    });

    try {
      const { data } = await graphqlRequest(userQuery, { id });
      const normalizedData = normalize(
        objectifySettings(depaginate('request', data.user)),
        userSchema,
      );
      dispatch({
        type: FETCH_USER_SUCCESS,
        payload: normalizedData,
        filter: 'all',
      });
    } catch (error) {
      dispatch({
        type: FETCH_USER_ERROR,
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

export function fetchProfileData({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // eslint-disable-next-line no-unused-vars

    dispatch({
      type: FETCH_USER_START,
    });

    try {
      const { data } = await graphqlRequest(profileQuery, { id });
      const normalizedData = normalize(data.user, userSchema);
      dispatch({
        type: FETCH_USER_SUCCESS,
        payload: normalizedData,
        filter: 'all',
      });
    } catch (error) {
      dispatch({
        type: FETCH_USER_ERROR,
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

export function deleteUser({ id }) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // eslint-disable-next-line no-unused-vars

    dispatch({
      type: DELETE_USER_START,
      id,
      properties: {
        deleted: {
          pending: true,
          success: false,
          error: null,
        },
      },
    });

    try {
      const { data } = await graphqlRequest(deleteUserMutation, { id });
      const { errors } = data.deleteUser;
      if (errors.length) {
        /* eslint-disable no-return-assign */
        const standardError = errors.reduce(
          (acc, curr) => (acc[curr] = { [curr]: { [curr]: true } }),
          {},
        );
        /* eslint-enable no-return-assign */

        dispatch({
          type: DELETE_USER_ERROR,
          payload: {
            errors,
          },

          message: { fields: standardError },
        });
        return false;
      }
      const normalizedData = normalize(data.deleteUser.user, userSchema);
      dispatch({
        type: DELETE_USER_SUCCESS,
        payload: normalizedData,
        filter: 'all',
        id,
        properties: {
          deleted: {
            pending: false,
            success: true,
            error: null,
          },
        },
      });
    } catch (error) {
      dispatch({
        type: DELETE_USER_ERROR,
        payload: {
          error,
        },
        id,
        properties: {
          deleted: {
            pending: false,
            success: false,
            error: error.message || 'Something went wrong',
          },
        },
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}
