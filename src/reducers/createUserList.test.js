/* eslint-env jest */
import createListReducer, * as listByFilter from './createUserList';
import { DELETE_USER_SUCCESS } from '../constants';

describe('createUserList reducers', () => {
  test('[DELETE_USER_SUCCESS] should remove id from lists', () => {
    const toDeleteId = '1';
    const toNotDeleteId = '2';
    const deletedUser = { id: toDeleteId };
    const testAction = {
      type: DELETE_USER_SUCCESS,
      payload: {
        entities: { users: { toDeleteId: deletedUser } },
        result: toDeleteId,
      },
    };
    const LIST_NAME = 'all';
    const initialState = { ids: [toDeleteId, toNotDeleteId] };
    const reducer = createListReducer(LIST_NAME);
    const resultState = reducer(initialState, testAction);
    expect(listByFilter.getIds(resultState)).not.toContain(toDeleteId);
    expect(listByFilter.getIds(resultState)).toContain(toNotDeleteId);
  });
});
