/* Add permissions here */
export const Permissions = {
  NONE: 0,
  CHANGE_OWN_PROFILE: 2,
  DELETE_OWN_ACCOUNT: 4,

  VIEW_PROPOSALS: 8,
  VIEW_STATEMENTS: 16,
  VIEW_VOTES: 32,

  VOTE: 64,
  MODIFY_OWN_STATEMENTS: 128,
  LIKE: 256,
  FLAG_STATEMENTS: 512,

  PUBLISH_PROPOSALS: 1024,
  REVOKE_PROPOSALS: 2048,
  SWITCH_POLLS: 4096,
  CLOSE_POLLS: 8192,

  ADD_TO_DISTRICT: 16384,
  REMOVE_FROM_DISTRICT: 32768,

  DELETE_STATEMENTS: 65536,
  FLAG_USER: 131072,
  VIEW_USER_INFO: 262144,

  DELETE_ACCOUNTS: 524288,
  NOTIFY_GROUPS: 1048576,
  NOTIFY_ALL: 2097152,
  TAKE_SURVEYS: 4194304,
  PUBLISH_SURVEYS: 8388608,
  CREATE_WORKTEAMS: 16777216,
};

/* Add new groups here - DON'T FORGET TO UPDATE THE SCHEMA*/
export const Groups = {
  SUPER_USER: 1,
  ADMIN: 2,
  MEMBER_MANAGER: 4,
  DISTRICT_KEEPER: 6,
  RELATOR: 8,
  MODERATOR: 16,
  VOTER: 32,
  VIEWER: 64,
  USER: 128,
};

/* eslint-disable no-bitwise */

/* Permission masks - Change here if you want to adjust permissions for groups */

/* Users */
const userMask =
  Permissions.CHANGE_OWN_PROFILE | Permissions.DELETE_OWN_ACCOUNT;

/* Viewers */
const viewerMask =
  Permissions.VIEW_PROPOSALS |
  Permissions.VIEW_STATEMENTS |
  Permissions.VIEW_VOTES |
  Permissions.TAKE_SURVEYS;

/* Voters */
const voterMask =
  Permissions.VOTE |
  Permissions.MODIFY_OWN_STATEMENTS |
  Permissions.LIKE |
  Permissions.FLAG_STATEMENTS;

/* Moderators */
const moderatorMask = Permissions.DELETE_STATEMENTS | Permissions.FLAG_USER;

/* Relators */
const relatorMask =
  Permissions.PUBLISH_PROPOSALS |
  Permissions.CLOSE_POLLS |
  Permissions.SWITCH_POLLS |
  Permissions.REVOKE_PROPOSALS;

/* District keepers */
const districtKeeperMask =
  Permissions.ADD_TO_DISTRICT | Permissions.REMOVE_FROM_DISTRICT;

const managerMask =
  Permissions.CHANGE_OWN_PROFILE |
  Permissions.DELETE_OWN_ACCOUNT |
  Permissions.VIEW_PROPOSALS |
  Permissions.VIEW_STATEMENTS |
  Permissions.VIEW_VOTES |
  Permissions.FLAG_USER |
  Permissions.FLAG_STATEMENTS;

/* Member managers */
const memberManagerMask = managerMask;

/* Admins */
const adminMask =
  managerMask |
  Permissions.DELETE_STATEMENTS |
  Permissions.DELETE_ACCOUNTS |
  Permissions.NOTIFY_GROUPS |
  Permissions.NOTIFY_ALL;

/* SUPERUSER - ONLY ONE ALLOWED - should not be able to participate
 * in the day-to-day business */
const superUserMask =
  Permissions.VIEW_PROPOSALS |
  Permissions.VIEW_STATEMENTS |
  Permissions.VIEW_VOTES |
  Permissions.NOTIFY_GROUPS;

/* Add new privileges here - DON'T FORGET TO UPDATE THE SCHEMA */
export const Privileges = {
  NONE: 0,
  GRANT_VIEWER: 2,
  GRANT_VOTER: 4,
  GRANT_MODERATOR: 8,
  GRANT_MEMBER_MANAGER: 16,
  GRANT_DISTRICT_KEEPER: 32,
  GRANT_RELATOR: 128,
  GRANT_ADMIN: 64,
};
/* Privilege masks - Change here if you want to adjust privileges for groups */

const memberManagerPrivileges =
  Privileges.GRANT_VIEWER | Privileges.GRANT_VOTER;

const adminPrivileges =
  memberManagerPrivileges |
  Privileges.GRANT_MODERATOR |
  Privileges.GRANT_RELATOR |
  Privileges.GRANT_DISTRICT_KEEPER |
  Privileges.GRANT_MEMBER_MANAGER;

const superUserPrivileges = Privileges.GRANT_ADMIN;

/* Privilege schema */
export const privileges = {
  SUPER_USER: superUserPrivileges,
  ADMIN: adminPrivileges,
  MEMBER_MANAGER: memberManagerPrivileges,
  DISTRICT_KEEPER: Privileges.NONE,
  RELATOR: Privileges.NONE,
  MODERATOR: Privileges.NONE,
  VOTER: Privileges.NONE,
  VIEWER: Privileges.NONE,
  USER: Privileges.NONE,
};

/* Permission schema */
const permissions = {
  SUPER_USER: superUserMask,
  ADMIN: adminMask,
  MEMBER_MANAGER: memberManagerMask,
  DISTRICT_KEEPER: districtKeeperMask,
  RELATOR: relatorMask,
  MODERATOR: moderatorMask,
  VOTER: voterMask,
  VIEWER: viewerMask,
  USER: userMask,
};

/* Permission schema */
export default {
  SUPER_USER: superUserMask,
  ADMIN: adminMask,
  MEMBER_MANAGER: memberManagerMask,
  DISTRICT_KEEPER: districtKeeperMask,
  RELATOR: relatorMask,
  MODERATOR: moderatorMask,
  VOTER: voterMask,
  VIEWER: viewerMask,
  USER: userMask,
};

export const calcRights = userGroups =>
  Object.keys(Groups).reduce(
    (acc, curr) => {
      if (userGroups & Groups[curr]) {
        acc.perm |= permissions[curr];
        acc.priv |= privileges[curr];
      }
      return acc;
    },
    { perm: 0, priv: 0 },
  );
