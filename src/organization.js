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

  VIEW_PROPOSALS: 8,
  VIEW_STATEMENTS: 16,
  VIEW_VOTES: 32,

  VOTE: 64,
  MODIFY_OWN_STATEMENTS: 128,
  LIKE: 256,
  FLAG_STATEMENTS: 512,

  PUBLISH_PROPOSALS: 1024,
  REVOKE_PROPOSALS: 2048,
  MODIFY_PROPOSALS: 4096,
  CLOSE_POLLS: 8192,

  ADD_TO_DISTRICT: 16384,
  REMOVE_FROM_DISTRICT: 32768,

  DELETE_STATEMENTS: 65536,
  MUTATE_PROFILES: 131072,
  VIEW_USER_INFO: 262144,

  DELETE_ACCOUNTS: 524288,
  NOTIFY_GROUPS: 1048576,
  NOTIFY_ALL: 2097152,
  TAKE_SURVEYS: 4194304,
  PUBLISH_SURVEYS: 8388608,
  CREATE_WORKTEAMS: 16777216,
  MANAGE_WORKTEAMS: 33554432,
  PUBLISH_DISCUSSIONS: 67108864,
  MAKE_COMMENT: 134217728,
};

/* Add new groups here - DON'T FORGET TO UPDATE THE SCHEMA */
export const Groups = {
  SUPER_USER: 1,
  ADMIN: 2,
  MEMBER_MANAGER: 4,
  DISTRICT_KEEPER: 8,
  RELATOR: 16,
  MODERATOR: 32,
  VOTER: 64,
  VIEWER: 128,
  GUEST: 256,
  SYSTEM: 512,
  TEAM_LEADER: 1024,
};

/* eslint-disable no-bitwise */

/* Permission masks - Change here if you want to adjust permissions for groups */

/* Users */
const guestMask =
  Permissions.CHANGE_OWN_PROFILE | Permissions.DELETE_OWN_ACCOUNT;

/* Viewers */
const viewerMask =
  Permissions.VIEW_PROPOSALS |
  Permissions.VIEW_STATEMENTS |
  Permissions.VIEW_VOTES |
  Permissions.MAKE_COMMENT |
  Permissions.TAKE_SURVEYS;

/* Voters */
const voterMask =
  Permissions.VOTE |
  Permissions.MODIFY_OWN_STATEMENTS |
  Permissions.LIKE |
  Permissions.FLAG_STATEMENTS;

/* Moderators */
const moderatorMask = Permissions.DELETE_STATEMENTS;

/* Relators */
const relatorMask =
  Permissions.PUBLISH_PROPOSALS |
  Permissions.CLOSE_POLLS |
  Permissions.MODIFY_PROPOSALS |
  Permissions.REVOKE_PROPOSALS |
  Permissions.PUBLISH_DISCUSSIONS;

/* District keepers */
const districtKeeperMask =
  Permissions.ADD_TO_DISTRICT | Permissions.REMOVE_FROM_DISTRICT;

/* Member managers */
const memberManagerMask =
  Permissions.MUTATE_PROFILES |
  Permissions.DELETE_ACCOUNTS |
  Permissions.VIEW_USER_INFO;

/* Admins */
const adminMask = Permissions.NOTIFY_ALL | Permissions.CREATE_WORKTEAMS;

/* SUPERUSER - ONLY ONE ALLOWED - should not be able to participate
 * in the day-to-day business */
const superUserMask =
  Permissions.CHANGE_OWN_PROFILE |
  Permissions.VIEW_PROPOSALS |
  Permissions.VIEW_STATEMENTS |
  Permissions.VIEW_VOTES |
  Permissions.NOTIFY_GROUPS |
  Permissions.MUTATE_PROFILES;

/* Add new privileges here - DON'T FORGET TO UPDATE THE SCHEMA */
export const Privileges = {
  NONE: 0,
  GRANT_GUEST: 2,
  GRANT_VIEWER: 4,
  GRANT_VOTER: 8,
  GRANT_MODERATOR: 16,
  GRANT_MEMBER_MANAGER: 32,
  GRANT_DISTRICT_KEEPER: 64,
  GRANT_RELATOR: 128,
  GRANT_ADMIN: 256,
  GRANT_LEADER: 512,
};
/* Privilege masks - Change here if you want to adjust privileges for groups */

const memberManagerPrivileges =
  Privileges.GRANT_GUEST | Privileges.GRANT_VIEWER | Privileges.GRANT_VOTER;

const adminPrivileges =
  memberManagerPrivileges |
  Privileges.GRANT_MODERATOR |
  Privileges.GRANT_RELATOR |
  Privileges.GRANT_DISTRICT_KEEPER |
  Privileges.GRANT_MEMBER_MANAGER |
  Privileges.GRANT_LEADER;

const superUserPrivileges = adminPrivileges | Privileges.GRANT_ADMIN;

/* Privilege schema */
export const PrivilegesSchema = {
  [Groups.SUPER_USER]: superUserPrivileges,
  [Groups.ADMIN]: adminPrivileges,
  [Groups.MEMBER_MANAGER]: memberManagerPrivileges,
  [Groups.DISTRICT_KEEPER]: Privileges.NONE,
  [Groups.RELATOR]: Privileges.NONE,
  [Groups.MODERATOR]: Privileges.NONE,
  [Groups.VOTER]: Privileges.NONE,
  [Groups.VIEWER]: Privileges.NONE,
  [Groups.GUEST]: Privileges.NONE,
  [Groups.SYSTEM]: Privileges.NONE,
};

/* Permission schema */
export const PermissionsSchema = {
  [Groups.SUPER_USER]: superUserMask,
  [Groups.ADMIN]: adminMask,
  [Groups.MEMBER_MANAGER]: memberManagerMask,
  [Groups.DISTRICT_KEEPER]: districtKeeperMask,
  [Groups.RELATOR]: relatorMask,
  [Groups.MODERATOR]: moderatorMask,
  [Groups.VOTER]: voterMask,
  [Groups.VIEWER]: viewerMask,
  [Groups.GUEST]: guestMask,
  [Groups.SYSTEM]: Privileges.NONE,
};

export const AccessMasks = {
  SSE: Permissions.VIEW_PROPOSALS | Permissions.VIEW_STATEMENTS,
  LEVEL_0: Permissions.CHANGE_OWN_PROFILE,
  LEVEL_1: viewerMask | voterMask,
  LEVEL_2:
    Groups.SUPER_USER |
    Groups.ADMIN |
    Groups.DISTRICT_KEEPER |
    Groups.MEMBER_MANAGER |
    Groups.RELATOR |
    Groups.TEAM_LEADER |
    Groups.MODERATOR,
  GROUPS_MANAGER:
    Privileges.GRANT_VIEWER |
    Privileges.GRANT_VOTER |
    Privileges.GRANT_MODERATOR |
    Privileges.GRANT_MEMBER_MANAGER |
    Privileges.GRANT_DISTRICT_KEEPER |
    Privileges.GRANT_ADMIN,
  NOTIFICATION: Permissions.NOTIFY_ALL | Permissions.NOTIFY_GROUPS,
  WORKTEAM_MANAGER: Groups.ADMIN | Groups.TEAM_LEADER,
};

export const GroupConditions = {
  [Groups.ADMIN]: Privileges.GRANT_ADMIN,
  [Groups.DISTRICT_KEEPER]: Privileges.GRANT_DISTRICT_KEEPER,
  [Groups.MEMBER_MANAGER]: Privileges.GRANT_MEMBER_MANAGER,
  [Groups.MODERATOR]: Privileges.GRANT_MODERATOR,
  [Groups.RELATOR]: Privileges.GRANT_RELATOR,
  [Groups.VOTER]: Privileges.GRANT_VOTER,
  [Groups.VIEWER]: Privileges.GRANT_VIEWER,
  [Groups.GUEST]: Privileges.GRANT_GUEST,
  [Groups.TEAM_LEADER]: Privileges.GRANT_LEADER,
};

export const calcRights = membershipData =>
  membershipData.reduce((acc, curr) => {
    acc[curr.id] = curr.rights;
    return acc;
  }, {});

const protectedViews = {
  Proposals: { type: 'permissions', name: 'LEVEL_1' },
  Proposal: { type: 'permissions', name: 'LEVEL_1' },
  Survey: { type: 'permissions', name: 'LEVEL_1' },
  Surveys: { type: 'permissions', name: 'LEVEL_1' },
  Tagged: { type: 'permissions', name: 'LEVEL_1' },
  Home: { type: 'permissions', name: 'LEVEL_1' },
  Feed: { type: 'permissions', name: 'LEVEL_1' },
  Admin: { type: 'groups', name: 'platform' },
  NotificationPanel: { type: 'permissions', name: 'NOTIFICATION' },
  GroupsPanel: { type: 'privileges', name: 'GROUPS_MANAGER' },
  SSE: { type: 'permissions', name: 'LEVEL_1' },
  AccountList: { type: 'permissions', name: 'LEVEL_1' },
  WorkteamList: { type: 'permissions', name: 'LEVEL_1' },
  Workteam: { type: 'permissions', name: 'LEVEL_1' },
  WorkteamManager: { type: 'groups', name: 'WORKTEAM_MANAGER' },
  Discussion: { type: 'permissions', name: 'LEVEL_1' },
};
export const canAccess = (user, name) => {
  if (user) {
    const qualification = protectedViews[name];
    if (user.rights[qualification.name]) {
      return true;
    }
  }
  return false;
};

/* Groups which cannot be changed with the normal procedure */
const restrictedGroups =
  Groups.SUPER_USER | Groups.ADMIN | Groups.MEMBER_MANAGER | Groups.TEAM_LEADER;

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
