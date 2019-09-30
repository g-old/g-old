/* eslint-disable import/prefer-default-export */

import { SET_SIZE_VARIABLE } from '../constants';

export function setSizeVariable({ value }) {
  return {
    type: SET_SIZE_VARIABLE,
    payload: {
      value,
    },
  };
}
