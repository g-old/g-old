/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';

export const createMutation = (types, resource, query, schema, selectorFn) => {
  const [requestType, successType, errorType] = types;
  return args => async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: requestType,
    });

    try {
      const { data } = await graphqlRequest(query, {
        [resource]: args,
      });
      const normalizedData = normalize(selectorFn(data), schema);

      dispatch({ type: successType, payload: normalizedData });
    } catch (e) {
      dispatch({
        type: errorType,
        message: e.message || 'Something went wrong',
      });
    }
  };
};
