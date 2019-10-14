import {
  UPLOAD_FILE_START,
  UPLOAD_FILE_SUCCESS,
  UPLOAD_FILE_ERROR,
} from '../../constants';

const upload = (state = {}, action) => {
  switch (action.type) {
    case UPLOAD_FILE_START:
      return { pending: true, error: false, success: false };
    case UPLOAD_FILE_SUCCESS:
      return { pending: false, error: false, success: true };
    case UPLOAD_FILE_ERROR:
      return { pending: false, error: true, success: false };

    default:
      return state;
  }
};
export default upload;
export const getStatus = state => state || {};
