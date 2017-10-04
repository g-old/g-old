/* eslint-env jest */
/* eslint-disable no-bitwise */
import { canMutate, Models } from './accessControl';
import { Groups, Privileges, Permissions } from '../organization';

describe('userWriteControl', () => {
  it('Should allow to change group membership', () => {
    const testViewer = {
      id: 1,
      privileges: Privileges.GRANT_GUEST,
      permissions: Permissions.MUTATE_PROFILES,
      groups: Groups.GUEST,
    };
    const testData = { groups: 0, id: 2 };
    expect(canMutate(testViewer, testData, Models.USER)).toBe(true);
  });

  it('Should allow to add a followee', () => {
    const testViewer = {
      id: 1,
      privileges: 0,
      permissions: Permissions.CHANGE_OWN_PROFILE,
      groups: Groups.GUEST,
    };
    const testData = { followee: '2', id: 1 };
    expect(canMutate(testViewer, testData, Models.USER)).toBe(true);
  });
});

describe('workTeamWriteControl', () => {
  it('Should allow to add new WT', () => {
    const testViewer = {
      id: 1,
      privileges: 0,
      permissions: Permissions.CREATE_WORKTEAMS,
      groups: Groups.GUEST,
    };
    const testData = { coordinatorId: '2', name: 'NAME' };
    expect(canMutate(testViewer, testData, Models.WORKTEAM)).toBe(true);
  });
});

describe('activityWriteControl', () => {
  it('Should allow to add new Activity', () => {
    const testViewer = {
      id: 1,
      privileges: 0,
      permissions: Permissions.CHANGE_OWN_PROFILE,
      groups: Groups.GUEST,
    };
    const testData = {
      verb: 'VERB',
      type: 'type',
      objectId: 2,
      content: 'CONTENT',
    };
    expect(canMutate(testViewer, testData, Models.ACTIVITY)).toBe(true);
  });
});
