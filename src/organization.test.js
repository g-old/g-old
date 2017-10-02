/* eslint-env jest */
/* eslint-disable no-bitwise */
import {
  canChangeGroups,
  calcRights,
  Groups,
  Privileges,
  PermissionsSchema,
  PrivilegesSchema,
} from './organization';

describe('canChangeGroups', () => {
  it('Should allow to assign a user to a group', () => {
    const testActor = {
      privileges: Privileges.GRANT_USER,
      groups: Groups.USER,
    };
    const testTarget = { groups: 0, permissions: 0 };
    const updatedGroups = Groups.USER;
    expect(canChangeGroups(testActor, testTarget, updatedGroups)).toBe(true);
    testActor.privileges = Privileges.GRANT_VIEWER; // Wrong privilege
    expect(canChangeGroups(testActor, testTarget, updatedGroups)).toBe(false);
  });

  it('Should allow to remove a user from a group', () => {
    const testActor = {
      privileges: Privileges.GRANT_USER,
      groups: Groups.USER,
    };
    const testTarget = { groups: Groups.USER, permissions: 0 };
    const updatedGroups = 0;
    expect(canChangeGroups(testActor, testTarget, updatedGroups)).toBe(true);
    testActor.privileges = Privileges.GRANT_VIEWER; // Wrong privilege
    expect(canChangeGroups(testActor, testTarget, updatedGroups)).toBe(false);
  });

  it('Should allow su to assign to  admin group', () => {
    const testActor = {
      privileges: Privileges.GRANT_ADMIN,
      groups: Groups.SUPER_USER,
    };
    const testTarget = { groups: 0, permissions: 0 };
    const updatedGroups = Groups.ADMIN;
    expect(canChangeGroups(testActor, testTarget, updatedGroups)).toBe(true);
    // Admin only!
    expect(canChangeGroups(testActor, testTarget, Groups.USER)).toBe(false);
  });
  it('Should deny membership change for restricted groups if not admin', () => {
    const testActor = {
      privileges: Privileges.GRANT_USER | Privileges.GRANT_MEMBER_MANAGER,
      groups: 0,
    };
    const testTarget = {
      groups: Groups.USER | Groups.MEMBER_MANAGER,
      permissions: 0,
    };
    const updatedGroups = 0;
    expect(canChangeGroups(testActor, testTarget, updatedGroups)).toBe(false);
    testActor.groups = Groups.ADMIN;
    expect(canChangeGroups(testActor, testTarget, updatedGroups)).toBe(true);
    testTarget.groups = Groups.ADMIN;
    // Admin can change other admin
    expect(
      canChangeGroups(testActor, testTarget, Groups.ADMIN | Groups.USER),
    ).toBe(true);
  });
});

describe('calcRights', () => {
  it('Should assign permissions and privileges', () => {
    const testGroup = Groups.ADMIN;
    const testPermissions = PermissionsSchema[Groups.ADMIN];
    const testPrivileges = PrivilegesSchema[Groups.ADMIN];
    expect(calcRights(testGroup)).toEqual({
      priv: testPrivileges,
      perm: testPermissions,
    });
  });
});
