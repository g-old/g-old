import { denormalize } from 'normalizr';
import {
  LOAD_PLATTFORM_SUCCESS,
  CREATE_PLATTFORM_SUCCESS,
  UPDATE_PLATTFORM_SUCCESS,
} from '../constants';
import { plattform as plattformSchema } from '../store/schema';

export default function plattformReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_PLATTFORM_SUCCESS:
    case UPDATE_PLATTFORM_SUCCESS:
    case CREATE_PLATTFORM_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.plattform,
      };
    }

    default:
      return state;
  }
}

const hydrateEntity = (data, entities) =>
  denormalize(data, plattformSchema, {
    ...entities,
    users: entities.users.byId,
  });

export const getPlattform = state => {
  const { plattform } = state;
  return hydrateEntity(plattform, state.entities);
};
