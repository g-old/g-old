/* eslint-disable import/prefer-default-export */
import { normalize } from 'normalizr';

export const createMutation = (
  types,
  resource,
  query,
  schema,
  selectorFn,
  infoFn,
) => {
  const [requestType, successType, errorType] = types;
  return args => async (dispatch, getState, { graphqlRequest }) => {
    dispatch({
      type: requestType,
      ...(infoFn && infoFn(args)),
    });

    try {
      const { data } = await graphqlRequest(query, {
        [resource]: args,
      });
      const normalizedData = normalize(selectorFn(data), schema);

      dispatch({
        type: successType,
        payload: normalizedData,
        ...(infoFn && infoFn(args)),
      });
    } catch (e) {
      dispatch({
        ...(infoFn && infoFn(args)),
        type: errorType,
        message: e.message || 'Something went wrong',
      });
    }
  };
};
