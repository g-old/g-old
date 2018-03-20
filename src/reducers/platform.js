import { denormalize } from 'normalizr';
import {
  LOAD_PLATFORM_SUCCESS,
  CREATE_PLATFORM_SUCCESS,
  UPDATE_PLATFORM_SUCCESS,
} from '../constants';
import { platform as platformSchema } from '../store/schema';

export default function platformReducer(state = {}, action) {
  switch (action.type) {
    case LOAD_PLATFORM_SUCCESS:
    case UPDATE_PLATFORM_SUCCESS:
    case CREATE_PLATFORM_SUCCESS: {
      return {
        ...state,
        ...action.payload.entities.platform,
      };
    }

    default:
      return state;
  }
}

const hydrateEntity = (data, entities) =>
  denormalize(data, platformSchema, {
    ...entities,
    users: entities.users.byId,
  });

export const getPlatform = state => {
  const { platform } = state;
  return hydrateEntity(platform, state.entities);
};
