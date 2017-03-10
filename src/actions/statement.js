/* eslint-disable import/prefer-default-export */
import {
  CREATE_STATEMENT_START,
  CREATE_STATEMENT_SUCCESS,
  CREATE_STATEMENT_ERROR,
  UPDATE_STATEMENT_START,
  UPDATE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_ERROR,
} from '../constants';

const statementResult = `{
  id
  title
  likes
  text
  pollId
  createdAt
  updatedAt
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
  mutation ($vote:VoteInput $text:String $title:String $pollId:ID! $id: ID) {
    createStatement (statement:{vote:$vote text:$text title:$title pollId:$pollId id:$id })${statementResult}
  }
`;

const updateStatementMutation = `
  mutation ($vote:VoteInput $text:String $title:String $pollId:ID! $id: ID) {
    updateStatement (statement:{vote:$vote text:$text title:$title pollId:$pollId id:$id })${statementResult}
  }
`;


export function createStatement(statement) {
  return async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: CREATE_STATEMENT_START,
      payload: {
        statement,
      },
    });
    try {
      const { data } = await graphqlRequest(createStatementMutation, statement);

      dispatch({
        type: CREATE_STATEMENT_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CREATE_STATEMENT_ERROR,
        payload: {
          error,
        },
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
      payload: {
        statement,
      },
    });
    try {
      const { data } = await graphqlRequest(updateStatementMutation, { ...statement });

      dispatch({
        type: UPDATE_STATEMENT_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_STATEMENT_ERROR,
        payload: {
          error,
        },
      });
      return false;
    }

    return true;
  };
}
