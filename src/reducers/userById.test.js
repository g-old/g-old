/* eslint-env jest */
import reducer, * as fromUser from './userById';
import { FETCH_USER_SUCCESS } from '../constants';

describe('userbyId reducers', () => {
  it('[FETCH_USER_SUCCESS] : Should merge followees', () => {
    let testState = {};
    const user = { id: '1', followees: ['2'] };
    const testAction = {
      type: FETCH_USER_SUCCESS,
      payload: { entities: { users: { '1': user } } },
    };
    testState = reducer({}, testAction);
    expect(fromUser.getUser(testState, '1')).toEqual(user);

    const addFollowee = ['2', '3'];
    testAction.payload.entities.users['1'].followees = addFollowee;
    user.followees = addFollowee;
    testState = reducer(testState, testAction);
    expect(fromUser.getUser(testState, '1')).toEqual(user);

    const removeFollowee = ['3'];
    testAction.payload.entities.users['1'].followees = removeFollowee;
    user.followees = removeFollowee;
    testState = reducer(testState, testAction);
    expect(fromUser.getUser(testState, '1')).toEqual(user);
  });

  it('[FETCH_USER_SUCCESS] : Should preserve permissions and privileges', () => {
    const user = { id: '1', permissions: 1 };
    let testState = { '1': user };
    const testAction = {
      type: FETCH_USER_SUCCESS,
      payload: { entities: { users: { '1': { id: '1' } } } },
    };
    testState = reducer(testState, testAction);
    expect(fromUser.getUser(testState, '1')).toEqual(user);
  });
});
