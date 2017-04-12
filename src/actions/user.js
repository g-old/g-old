/* eslint-disable import/prefer-default-export */
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
mutation($id:ID $name:String, $surname:String, $role: String){
  updateUser(user:{id:$id name:$name, surname:$surname, role:$role}){
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
    });

    try {
      const { data } = await graphqlRequest(userList, { role });
      dispatch({
        type: LOAD_USERS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: LOAD_USERS_ERROR,
        payload: {
          role,
          error,
        },
      });
      return false;
    }

    return true;
  };
}

export function createUser(newUser) {
  return async dispatch => {
    dispatch({
      type: CREATE_USER_START,
      payload: {
        newUser,
      },
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
        });
        return false;
      }
      dispatch({
        type: CREATE_USER_SUCCESS,
        payload: { user },
      });
    } catch (error) {
      dispatch({
        type: CREATE_USER_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}

export function updateUser(user) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: UPDATE_USER_START,
      payload: {
        user,
      },
    });

    try {
      const { data } = await graphqlRequest(updateUserMutation, user);
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_USER_ERROR,
        payload: {
          user,
          error,
        },
      });
      return false;
    }

    return true;
  };
}
