/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';
import { genStatusIndicators } from '../core/helpers';
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
  FIND_USER_SUCCESS,
  FIND_USER_ERROR,
  FETCH_USER_START,
  FETCH_USER_SUCCESS,
  FETCH_USER_ERROR,
} from '../constants';
import { getUsersIsFetching } from '../reducers';

const userFields = `
  id,
  privilege,
    name,
    surname,
    avatar,
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
const workTeam = `
  id
  name
  coordinator{
    name
    surname
    avatar
    id
  }`;
const userQuery = `
query ($id:ID!) {
  user (id:$id) {
    lastLogin
    emailVerified
    email
    numStatements
    numFollowers
    numLikes
    workTeams{
      ${workTeam}
    }
    followees{
      ${userFields}
    }
    ${userFields}

  }
}
`;

const profileQuery = `
query ($id:ID!) {
  user (id:$id) {
    numStatements
    numFollowers
    numLikes
    workTeams{
      ${workTeam}
    }
    ${userFields}
  }
}
`;

const updateUserMutation = `
mutation($id:ID $name:String, $surname:String, $role:String, $email:String, $password:String, $passwordOld:String, $followee:ID, $privilege:Int){
  updateUser( user:{id:$id name:$name, surname:$surname, role:$role, email:$email, password:$password passwordOld:$passwordOld followee:$followee privilege:$privilege}){
    user{${userFields}
    email,
    emailVerified,
    privilege
    followees{
      id,
      name,
      surname,
      avatar
    }
  }
  errors
  }
}
`;

const userSearch = `
query ($term:String) {
  searchUser (term:$term) {
  ${userFields}
  }
}
`;

export function loadUserList(role) {
  return async (dispatch, getState, { graphqlRequest }) => {
    // TODO caching!

    if (getUsersIsFetching(getState(), role)) {
      return false;
    }
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
      const errors = data.updateUser.errors;
      if (errors.length) {
        const standardError = errors.reduce(
          (acc, curr) => (acc[curr] = { [curr]: { [curr]: true } }),
          {},
        );
        dispatch({
          type: UPDATE_USER_ERROR,
          payload: {
            errors,
          },
          message: { fields: standardError },
          properties,
          id: user.id,
        });
        return false;
      }
      const normalizedData = normalize(data.updateUser.user, userSchema);
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
