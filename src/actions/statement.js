/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';

import {
  CREATE_STATEMENT_START,
  CREATE_STATEMENT_SUCCESS,
  CREATE_STATEMENT_ERROR,
  UPDATE_STATEMENT_START,
  UPDATE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_ERROR,
  DELETE_STATEMENT_START,
  DELETE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_ERROR,
  LOAD_FLAGGEDSTMTS_START,
  LOAD_FLAGGEDSTMTS_SUCCESS,
  LOAD_FLAGGEDSTMTS_ERROR,
  FLAG_STATEMENT_START,
  FLAG_STATEMENT_SUCCESS,
  FLAG_STATEMENT_ERROR,
  UPDATE_FLAGGEDSTMT_START,
  UPDATE_FLAGGEDSTMT_SUCCESS,
  UPDATE_FLAGGEDSTMT_ERROR,
} from '../constants';
import {
  statement as statementSchema,
  flaggedStatementArray as flaggedArraySchema,
  flaggedStatement as flaggedStatementSchema,
} from '../store/schema';

const statementResult = `{
  id
  likes
  text
  pollId
  createdAt
  updatedAt
  deletedAt
  vote{
    id
    position
  }
  author{
    id
    name
    surname
    avatar
  }
}
`;

const createStatementMutation = `
  mutation ($vote:VoteInput $text:String $pollId:ID! $id: ID) {
    createStatement (statement:{vote:$vote text:$text pollId:$pollId id:$id })${statementResult}
  }
`;

const updateStatementMutation = `
  mutation ($vote:VoteInput $text:String $pollId:ID! $id: ID) {
    updateStatement (statement:{vote:$vote text:$text pollId:$pollId id:$id })${statementResult}
  }
`;

const deleteStatementMutation = `
  mutation ($pollId:ID! $id: ID) {
    deleteStatement (statement:{pollId:$pollId id:$id })${statementResult}
  }
`;
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
const flaggedStatement = `
id,
flagger{
  ${userFields}
},
flaggedUser{
  ${userFields}
},
statement ${statementResult}
content,
count,
createdAt,
state,
solver{
  ${userFields}
}
`;
const flaggedStatements = `
  query($state:String){
    flaggedStatements(state:$state){
      ${flaggedStatement}
      solver{
        ${userFields}
      }
    }
  }
`;

const flagConnection = `
query($first:Int, $after:String $state:String){
  flagConnection(first:$first after:$after state:$state){
    pageInfo{
      hasNextPage
      endCursor
    }
    edges{
      node{
          ${flaggedStatement}
      }
    }
  }
}
`;

const flagStatement = `
mutation($statementId:ID, $content:String, $action:action){
  flag(statement:{statementId:$statementId, content:$content, action:$action}){
    ${flaggedStatement}
  }
}
`;
const solveFlaggedStmt = `
mutation($id:ID $statementId:ID, $content:String, $action:action){
  solveFlag(statement:{id:$id statementId:$statementId, content:$content, action:$action}){
    ${flaggedStatement}
  }
}
`;
export function createStatement(statement) {
  return async (dispatch, getState, { graphqlRequest }) => {
    const virtualId = '0000';
    dispatch({
      type: CREATE_STATEMENT_START,
      id: virtualId,
    });
    try {
      const { data } = await graphqlRequest(createStatementMutation, statement);
      const normalizedData = normalize(data.createStatement, statementSchema);
      dispatch({
        type: CREATE_STATEMENT_SUCCESS,
        payload: normalizedData,
        id: virtualId,
      });
    } catch (error) {
      dispatch({
        type: CREATE_STATEMENT_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',

        id: virtualId,
      });
      return false;
    }

    return true;
  };
}

export function updateStatement(statement) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: UPDATE_STATEMENT_START,
      id: statement.id,
    });
    try {
      const { data } = await graphqlRequest(updateStatementMutation, statement);
      const normalizedData = normalize(data.updateStatement, statementSchema);
      dispatch({
        type: UPDATE_STATEMENT_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_STATEMENT_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',

        id: statement.id,
      });
      return false;
    }

    return true;
  };
}

export function deleteStatement(statement) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: DELETE_STATEMENT_START,
      id: statement.id,
    });
    try {
      const { data } = await graphqlRequest(deleteStatementMutation, statement);
      const normalizedData = normalize(data.deleteStatement, statementSchema);
      dispatch({
        type: DELETE_STATEMENT_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: DELETE_STATEMENT_ERROR,
        payload: {
          error,
        },
        message: error.message || 'Something went wrong',
        id: statement.id,
      });
      return false;
    }

    return true;
  };
}

export function loadFlaggedStatementsConnection(state, first, after) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_FLAGGEDSTMTS_START,
      filter: state,
    });
    try {
      const { data } = await graphqlRequest(flagConnection, { state, first, after });
      const flags = data.flagConnection.edges.map(f => f.node);
      const normalizedData = normalize(flags, flaggedArraySchema);
      dispatch({
        type: LOAD_FLAGGEDSTMTS_SUCCESS,
        payload: normalizedData,
        filter: state,
        pagination: data.flagConnection.pageInfo,
      });
    } catch (error) {
      dispatch({
        type: LOAD_FLAGGEDSTMTS_ERROR,
        payload: {
          error,
        },
        filter: state,
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}

export function loadFlaggedStatements(state) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: LOAD_FLAGGEDSTMTS_START,
      filter: state,
    });
    try {
      const { data } = await graphqlRequest(flaggedStatements, { state });
      const normalizedData = normalize(data.flaggedStatements, flaggedArraySchema);
      dispatch({
        type: LOAD_FLAGGEDSTMTS_SUCCESS,
        payload: normalizedData,
        filter: state,
      });
    } catch (error) {
      dispatch({
        type: LOAD_FLAGGEDSTMTS_ERROR,
        payload: {
          error,
        },
        filter: state,
        message: error.message || 'Something went wrong',
      });
      return false;
    }

    return true;
  };
}

export function flag(flagged) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: FLAG_STATEMENT_START,
    });
    try {
      const { data } = await graphqlRequest(flagStatement, flagged);
      const normalizedData = normalize(data.flag, flaggedStatementSchema);
      dispatch({
        type: FLAG_STATEMENT_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: FLAG_STATEMENT_ERROR,
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

export function solveFlag(flagged) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: UPDATE_FLAGGEDSTMT_START,
    });
    try {
      const { data } = await graphqlRequest(solveFlaggedStmt, flagged);
      const normalizedData = normalize(data.solveFlag, flaggedStatementSchema);
      dispatch({
        type: UPDATE_FLAGGEDSTMT_SUCCESS,
        payload: normalizedData,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_FLAGGEDSTMT_ERROR,
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
