/* eslint-env jest */
/* eslint-disable no-bitwise */
import { canMutate, canSee, Models } from './accessControl';
import {
  Groups,
  Privileges,
  Permissions,
  PermissionsSchema,
} from '../organization';
import { createTestActor } from '../../test/utils';

describe('userWriteControl', () => {
  it('Should allow to change group membership', () => {
    const testViewer = {
      id: 1,
      privileges: Privileges.GRANT_GUEST,
      permissions: Permissions.MUTATE_PROFILES,
      groups: Groups.GUEST,
    };
    let testData = { groups: 0, id: 2 };
    expect(canMutate(testViewer, testData, Models.USER)).toBe(true);

    const realTestViewer = createTestActor({
      groups: Groups.MEMBER_MANAGER | Groups.ADMIN,
    });
    testData = { groups: Groups.VOTER, id: 2 };
    expect(canMutate(realTestViewer, testData, Models.USER)).toBe(true);
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
  it('Should allow [Groups.SYSTEM] to change email', () => {
    const testViewer = {
      id: 1,
      groups: Groups.SYSTEM,
    };
    const testData = { email: 'email@example.com', id: 2 };
    expect(canMutate(testViewer, testData, Models.USER)).toBe(true);
  });
  it('Should allow [Groups.SUPER_USER] to change own email and password', () => {
    const testViewer = {
      id: 1,
      groups: Groups.SUPER_USER,
      permissions: PermissionsSchema[Groups.SUPER_USER],
    };
    const testData = {
      email: 'email@example.com',
      password: 'password',
      id: 1,
    };
    expect(canMutate(testViewer, testData, Models.USER)).toBe(true);
  });

  it('Should allow own name changes only to guests ', () => {
    const testData = {
      name: 'newname',
      surname: 'newsurname',
      id: 1,
    };
    expect(canMutate(createTestActor({ id: 1 }), testData, Models.USER)).toBe(
      true,
    );
    expect(
      canMutate(
        createTestActor({
          id: 1,
          groups: Groups.GUEST | Groups.VIEWER | Groups.ADMIN,
        }),
        testData,
        Models.USER,
      ),
    ).toBe(false);
  });

  it('Should block access if no data is submitted ', () => {
    const testData = {
      id: 1,
    };
    expect(
      canMutate(
        createTestActor({
          id: 1,
          groups: Groups.GUEST | Groups.VIEWER | Groups.ADMIN,
        }),
        testData,
        Models.USER,
      ),
    ).toBe(false);
  });

  it('Should allow [Groups.MEMBER_MANAGER] access to delete user', () => {
    const testData = {
      userId: 2,
    };
    expect(
      canMutate(
        createTestActor({
          id: 1,
          groups: Groups.MEMBER_MANAGER,
        }),
        testData,
        Models.USER,
      ),
    ).toBe(true);
  });
});

describe('workTeamWriteControl', () => {
  it('Should allow to add a new WT', () => {
    const testViewer = {
      id: 1,
      privileges: 0,
      permissions: Permissions.CREATE_WORKTEAMS,
      groups: Groups.GUEST,
    };
    const testData = { coordinatorId: '2', name: 'NAME' };
    expect(canMutate(testViewer, testData, Models.WORKTEAM)).toBe(true);
  });
  /*  it('Should not allow exclusive members of [Groups.GUEST] to join a WT', () => {
    const testViewer = {
      id: 1,
      privileges: 0,
      groups: Groups.GUEST,
    };
    const testData = {};
    expect(true).toBe(false);
  }); */
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

describe('proposalReadControl', () => {
  it('Should allow to get unprotected proposals', () => {
    const testViewer = createTestActor({ groups: Groups.VIEWER });
    const testData = {
      id: 1,
    };
    expect(canSee(testViewer, testData, Models.PROPOSAL)).toBe(true);
  });
  it('Should deny access to protected proposals', () => {
    const testViewer = createTestActor({ groups: Groups.VIEWER });
    const testData = {
      workteamId: 1,
    };
    expect(canSee(testViewer, testData, Models.PROPOSAL)).toBe(false);
  });
  it('Should allow access to members for protected proposals', () => {
    const testViewer = createTestActor({
      groups: Groups.VIEWER,
      memberships: 1,
    });
    const testData = {
      workteamId: 1,
    };
    expect(canSee(testViewer, testData, Models.PROPOSAL)).toBe(true);
  });
});
