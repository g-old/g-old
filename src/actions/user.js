/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';

import { user as userSchema, userList as userArray } from '../store/schema';
import {
  LOAD_USERS_START,
  LOAD_USERS_SUCCESS,
  LOAD_USERS_ERROR,
  UPDATE_USER_START,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  CREATE_USER_START,
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,
} from '../constants';

const userFields = `
id,
    name,
    surname,
    email,
    avatar
    role{
      id,
      type
    }
    `;
const userList = `
query ($role:String) {
  users (role:$role) {
    ${userFields}
  }
}
`;

const updateUserMutation = `
mutation($id:ID $name:String, $surname:String, $role:String, $email:String, $password:String, $passwordOld:String){
  updateUser(user:{id:$id name:$name, surname:$surname, role:$role, email:$email, password:$password passwordOld:$passwordOld}){
    ${userFields}
  }
}
`;

export function loadUserList(role) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_USERS_START,
      payload: {
        role,
      },
      filter: role,
    });

    try {
      const { data } = await graphqlRequest(userList, { role });
      const normalizedData = normalize(data.users, userArray);
      dispatch({
        type: LOAD_USERS_SUCCESS,
        payload: normalizedData,
        filter: role,
      });
    } catch (error) {
      dispatch({
        type: LOAD_USERS_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        filter: role,
      });
      return false;
    }

    return true;
  };
}

const initialId = '0000';
export function createUser(newUser) {
  return async dispatch => {
    const properties = Object.keys(newUser).reduce(
      (acc, curr) => {
        // eslint-disable-next-line no-param-reassign
        acc[curr] = {
          pending: true,
          success: false,
          error: null,
        };
        return acc;
      },
      {},
    );
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
        message: error || 'Something went wrong',
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
    const { id, ...rest } = user;
    const properties = Object.keys(rest).reduce(
      (acc, curr) => {
        // eslint-disable-next-line no-param-reassign
        acc[curr] = {
          pending: true,
          success: false,
          error: null,
        };
        return acc;
      },
      {},
    );

    dispatch({
      type: UPDATE_USER_START,
      properties,
      id: user.id,
    });

    try {
      const { data } = await graphqlRequest(updateUserMutation, user);
      const normalizedData = normalize(data.updateUser, userSchema);
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: normalizedData,
        properties,
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
