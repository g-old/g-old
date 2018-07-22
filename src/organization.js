// @flow

/* Rules:
  1) Nobody can change himself
  2) There is a set of privileged groups.
  Their members are mutable only by admins
  3) For the rest: Who can give, can take too.
  4) Only a superuser can assign to the admin group. */

/* Add permissions here */
export const Permissions = {
  NONE: 0,
  CHANGE_OWN_PROFILE: 2,
  DELETE_OWN_ACCOUNT: 4,
  MUTATE_PROFILES: 8,
  VIEW_USER_INFO: 16,
  DELETE_ACCOUNTS: 32,
};

/* Add new groups here - DON'T FORGET TO UPDATE THE SCHEMA */
export const Groups = {
  SUPER_USER: 1,
  ADMIN: 2,
  USER: 4,
  GUEST: 8,
  SYSTEM: 16,
};

/* eslint-disable no-bitwise */

/* Permission masks - Change here if you want to adjust permissions for groups */

/* Users */
const guestMask =
  Permissions.CHANGE_OWN_PROFILE | Permissions.DELETE_OWN_ACCOUNT;

/* SUPERUSER - ONLY ONE ALLOWED - should not be able to participate
 * in the day-to-day business */
const superUserMask =
  Permissions.CHANGE_OWN_PROFILE | Permissions.MUTATE_PROFILES;

const userMask = guestMask;
const adminMask = userMask;
/* Add new privileges here - DON'T FORGET TO UPDATE THE SCHEMA */
export const Privileges = {
  NONE: 0,
  GRANT_GUEST: 2,
  GRANT_USER: 4,
  GRANT_ADMIN: 8,
};
/* Privilege masks - Change here if you want to adjust privileges for groups */

const superUserPrivileges = Privileges.GRANT_ADMIN;
const adminPrivileges = Privileges.GRANT_USER | Privileges.GRANT_GUEST;

/* Privilege schema */
export const PrivilegesSchema = {
  [Groups.SUPER_USER]: superUserPrivileges,
  [Groups.ADMIN]: adminPrivileges,
};

/* Permission schema */
export const PermissionsSchema = {
  [Groups.SUPER_USER]: superUserMask,
  [Groups.ADMIN]: adminMask,
  [Groups.USER]: userMask,
  [Groups.GUEST]: guestMask,
  [Groups.SYSTEM]: Privileges.NONE,
};

export const AccessMasks = {};

export const GroupConditions = {
  [Groups.ADMIN]: Privileges.GRANT_ADMIN,
  [Groups.USER]: Privileges.GRANT_USER,
  [Groups.VIEWER]: Privileges.GRANT_VIEWER,
  [Groups.GUEST]: Privileges.GRANT_GUEST,
};

export const calcRights = userGroups =>
  Object.keys(Groups).reduce(
    (acc, curr) => {
      const r = Groups[curr];
      if (userGroups & r) {
        acc.perm |= PermissionsSchema[r];
        acc.priv |= PrivilegesSchema[r];
      }

      return acc;
    },
    { perm: 0, priv: 0 },
  );

const protectedViews = {
  Home: { type: 'permissions', name: 'LEVEL_1' },
  Admin: { type: 'groups', name: 'LEVEL_2' },
  GroupsPanel: { type: 'privileges', name: 'GROUPS_MANAGER' },
  SSE: { type: 'permissions', name: 'LEVEL_1' },
};
export const canAccess = (user, name) => {
  if (user) {
    const qualification = protectedViews[name];
    if (user[qualification.type] & AccessMasks[qualification.name]) {
      return true;
    }
  }
  return false;
};

/* Groups which cannot be changed with the normal procedure */
const restrictedGroups = Groups.SUPER_USER | Groups.ADMIN;

/* See test cases */
export const canChangeGroups = (actor, targetUser, updatedGroups) => {
  let groupDiff = targetUser.groups ^ updatedGroups;
  let canChange = false;
  if ((targetUser.groups & updatedGroups) !== targetUser.groups) {
    // remove group
    groupDiff &= ~updatedGroups; // get only new bits

    if (targetUser.groups & restrictedGroups) {
      if (actor.groups & (Groups.SUPER_USER | Groups.ADMIN)) {
        canChange = true;
      }
    } else {
      canChange = true;
    }

    if (!canChange) {
      return false;
    }
  }
  return Object.keys(Groups).every(groupname => {
    if (groupDiff & Groups[groupname]) {
      if ((actor.privileges & GroupConditions[Groups[groupname]]) === 0) {
        return false;
      }
    }
    return true;
  });
};

export const isAdmin = viewer => viewer && (viewer.groups & Groups.ADMIN) > 0;

export const getUpdatedGroup = (oldGroups: number, updatedGroups: number) => {
  let groupDiff = oldGroups ^ updatedGroups;
  let added = true;
  if ((oldGroups & updatedGroups) !== oldGroups) {
    // remove group
    added = false;
    groupDiff &= ~updatedGroups; // get only new bits
  }
  const groups = Object.keys(Groups).reduce((acc, curr) => {
    if (groupDiff & Groups[curr]) {
      acc.push(curr);
    }
    return acc;
  }, []);

  return { added, names: groups, value: groupDiff };
};
