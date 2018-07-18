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

describe('calcRights', () => {
  it('Should assign permissions and privileges', () => {
    let testGroup;
    let testPermissions;
    let testPrivileges;
    Object.keys(Groups).forEach(key => {
      testGroup = Groups[key];
      testPermissions = PermissionsSchema[testGroup];
      testPrivileges = PrivilegesSchema[testGroup];
      expect(calcRights(testGroup)).toEqual({
        priv: testPrivileges,
        perm: testPermissions,
      });
    });
  });
});
