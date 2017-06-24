import {
  CHECK_PSUB_STATUS,
  CREATE_PSUB_START,
  CREATE_PSUB_SUCCESS,
  CREATE_PSUB_ERROR,
  DELETE_PSUB_START,
  DELETE_PSUB_ERROR,
  DELETE_PSUB_SUCCESS,
} from '../../constants';

const subscription = (
  state = { pending: false, disabled: true, isPushEnabled: false, error: null },
  action,
) => {
  switch (action.type) {
    case CHECK_PSUB_STATUS:
    case DELETE_PSUB_START:
    case DELETE_PSUB_ERROR:
    case DELETE_PSUB_SUCCESS:
    case CREATE_PSUB_START:
    case CREATE_PSUB_SUCCESS:
    case CREATE_PSUB_ERROR: {
      return { ...state, ...action.payload };
    }

    default:
      return state;
  }
};

export default subscription;
export const getStatus = state => state;
