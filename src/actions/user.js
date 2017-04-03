/* eslint-disable import/prefer-default-export */
import {
  LOAD_USERS_START,
  LOAD_USERS_SUCCESS,
  LOAD_USERS_ERROR,
  UPDATE_USER_START,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
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
query ($role_id:Int) {
  users (role_id:$role_id) {
    ${userFields}
  }
}
`;

const updateUserMutation = `
mutation($id:ID $name:String, $surname:String, $roleId: Int){
  updateUser(user:{id:$id name:$name, surname:$surname, roleId:$roleId}){
    ${userFields}
  }
}
`;

export function loadUserList(roleId) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    dispatch({
      type: LOAD_USERS_START,
      payload: {
        roleId,
      },
    });

    try {
      const { data } = await graphqlRequest(userList, { role_id: roleId });
      dispatch({
        type: LOAD_USERS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: LOAD_USERS_ERROR,
        payload: {
          roleId,
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
