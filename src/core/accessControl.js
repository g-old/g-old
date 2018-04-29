// @flow
import {
  Permissions,
  Groups,
  AccessMasks,
  PermissionsSchema,
} from '../organization';
/* eslint-disable no-bitwise */
// TODO make object
export const Models = {
  USER: 'USER',
  PROPOSAL: 'PROPOSAL',
  STATEMENT: 'STATEMENT',
  FLAG: 'FLAG',
  S_LIKE: 'S_LIKE',
  POLL: 'POLL',
  VOTE: 'VOTE',
  NOTIFICATION: 'NOTIFICATION',
  GROUP: 'GROUP',
  ACTIVITY: 'ACTIVITY',
  DISCUSSION: 'DISCUSSION',
  COMMENT: 'COMMENT',
  REQUEST: 'REQUEST',
  TAG: 'TAG',
  PHASE: 'PHASE',
};

type tModel = $Keys<typeof Models>;

/* GENERATOR_FN */
/* eslint-disable no-unused-vars */
function phaseReadControl(viewer, data) {
  console.error('Access control for Phase not implemented');
  return true;
}
function phaseWriteControl(viewer, data) {
  console.error('Access control for Phase not implemented');
  return true;
}
function assetReadControl(viewer, data) {
  console.error('Access control for Asset not implemented');
  return true;
}
function assetWriteControl(viewer, data) {
  console.error('Access control for Asset not implemented');
  return true;
}
function platformReadControl(viewer, data) {
  console.error('Access control for Platform not implemented');
  return true;
}
function platformWriteControl(viewer, data) {
  console.error('Access control for Platform not implemented');
  return true;
}
function tagReadControl(viewer, data) {
  console.error('Access control for Tag not implemented');
  return true;
}
function tagWriteControl(viewer, data) {
  console.error('Access control for Tag not implemented');
  return true;
}
function requestReadControl(viewer, data) {
  console.error('Access control not implemented');
  return true;
}
function requestWriteControl(viewer, data) {
  console.error('Access control not implemented');
  return true;
}

function checkIfMember(viewer, resource) {
  if (resource) {
    if (resource.groupId) {
      // assumes there exist only workteams
      if (viewer.groups & Groups.SYSTEM) {
        return true;
      }
      return (
        viewer.wtMemberships && viewer.wtMemberships.includes(resource.groupId)
      );
    }
    return true; // is not owned by wt/group
  }
  return false; // since no membership is required
}

function userWriteControl(viewer, data) {
  if (data.id && Object.keys(data).length === 1) {
    if ((viewer.permissions & Permissions.DELETE_ACCOUNTS) > 0) {
      return true;
    }
    return false;
  }
  // own data can be changed
  if (
    viewer &&
    viewer.id == data.id // eslint-disable-line eqeqeq
  ) {
    if (!(viewer.permissions & Permissions.CHANGE_OWN_PROFILE)) {
      return false;
    }
    if (data.name || data.surname) {
      return viewer.groups === Groups.GUEST;
    }
    if (data.rights == null) {
      return true; // Nobody can change his own memberships
    }
  }
  if (viewer.rights.system) {
    // to set email as verified, reset password,
    if (data.email || data.password) {
      return true;
    }
  }
  if (viewer.rights.platform) {
    if (data.thumbnail || data.dataUrl || data.name || data.surname) {
      return true;
    }
    if (data.rights != null) {
      if (viewer.rights.platform) {
        return true;
        // TODO further checks!
      }
    }
  }
  if (data.userId && (viewer.permissions & Permissions.DELETE_ACCOUNTS) > 0) {
    return true;
  }

  return false;
}

function userReadControl(viewer, data) {
  return (
    // eslint-disable-next-line eqeqeq
    viewer.id == data.id || viewer.rights.platform || viewer.rights.system
  );
}

function proposalReadControl(viewer, data) {
  if (viewer.permissions & Permissions.VIEW_PROPOSALS) {
    return checkIfMember(viewer, data);
  }
  return false;
}

function proposalWriteControl(viewer, data) {
  if (
    viewer.rights[data.groupId] &&
    viewer.rights[data.groupId].proposal.includes('writeSameGroup')
  ) {
    return true;
  } else if (viewer.rights.platform) {
    console.error('TEST_ ALLOW');
    return true;
  }
  return false;
}

function statementReadControl(viewer, data) {
  if (viewer.permissions & Permissions.VIEW_STATEMENTS) {
    return checkIfMember(viewer, data.proposal);
  }
  return false;
}

function statementWriteControl(viewer, data) {
  if (
    data.proposal.state === 'survey' &&
    viewer.permissions & Permissions.TAKE_SURVEYS
  ) {
    return checkIfMember(viewer, data.proposal);
  }
  if (viewer.permissions & Permissions.MODIFY_OWN_STATEMENTS) {
    return checkIfMember(viewer, data.proposal);
  }
  return false;
}

function flagReadControl(viewer, data) {
  if (viewer.permissions & Permissions.DELETE_STATEMENTS) {
    return true;
  }
  return false;
}

function flagWriteControl(viewer, data) {
  if (data.content) {
    // = flagging
    if (viewer.permissions & Permissions.FLAG_STATEMENTS) {
      return true;
    }
  } else if (viewer.permissions & Permissions.DELETE_STATEMENTS) {
    return true;
  }
  return false;
}

function stmtLikeReadControl(viewer, data) {
  if (viewer.permissions & AccessMasks.LEVEL_1) {
    return true;
  }
  return false;
}
function stmtLikeWriteControl(viewer, data) {
  if (viewer.permissions & Permissions.LIKE) {
    return true;
  }
  return false;
}

function pollReadControl(viewer, data) {
  if (
    viewer.permissions &
    (AccessMasks.LEVEL_1 | Permissions.PUBLISH_PROPOSALS)
  ) {
    return true;
  }
  return false;
}
function pollWriteControl(viewer, data) {
  if (
    viewer.rights[data.groupId] &&
    viewer.rights[data.groupId].proposal.includes('writeSameGroup')
  ) {
    return true;
  } else if (viewer.rights.plattform) {
    console.error('TEST_ ALLOW');
    return true;
  } else if (data.isCoordinator) {
    return true;
  }
  return viewer.permissions & PermissionsSchema[Groups.ADMIN];
}

function voteReadControl(viewer, data) {
  if (viewer.permissions & AccessMasks.LEVEL_1) {
    return checkIfMember(viewer, data.proposal);
  }
  return false;
}
function voteWriteControl(viewer, data) {
  if (data.proposal.state === 'survey') {
    if (viewer.permissions & Permissions.TAKE_SURVEYS) {
      return checkIfMember(viewer, data.proposal);
    }
  } else if (viewer.permissions & Permissions.VOTE) {
    return checkIfMember(viewer, data.proposal);
  }
  return false;
}

function notificationReadControl(viewer, data) {
  if (viewer.permissions & AccessMasks.LEVEL_0) {
    return true;
  }
  return false;
}
function notificationWriteControl(viewer, data) {
  if (
    viewer.permissions &
    (Permissions.NOTIFY_GROUPS | Permissions.NOTIFY_ALL)
  ) {
    return true;
  }
  return false;
}

function activityReadControl(viewer, data) {
  if (viewer.permissions & AccessMasks.LEVEL_0) {
    return true;
  }
  return false;
}
function activityWriteControl(viewer, data) {
  if (
    (viewer.permissions & AccessMasks.LEVEL_0) > 0 ||
    (viewer.groups & Groups.SYSTEM) > 0
  ) {
    return true;
  }
  return false;
}

function groupReadControl(viewer, data) {
  if (viewer.rights.platform) {
    return true;
  }
  return false;
}
function groupWriteControl(viewer, data) {
  if (viewer.rights[data.id] && viewer.rights[data.id].includes('admin')) {
    return true;
  } else if (
    viewer.rights.platform &&
    viewer.rights.platform.includes('admin')
  ) {
    return true;
  }

  return false;
}

function discussionReadControl(viewer, data) {
  if (viewer.wtMemberships.includes(data.group_id)) {
    return true;
  }
  return false;
}
function discussionWriteControl(viewer, data) {
  if (data.workTeamId) {
    if (data.isCoordinator) {
      return true;
    }
    return viewer.permissions & PermissionsSchema[Groups.ADMIN];
  } else if (viewer.permissions & Permissions.PUBLISH_DISCUSSIONS) {
    return true;
  }
  return false;
}
function commentReadControl(viewer, data) {
  if (viewer.wtMemberships.includes(data.discussion.groupId)) {
    // eslint-disable-line
    return true;
  }
  return false;
}
function commentWriteControl(viewer, data) {
  if (data.discussion.closedAt) {
    return false;
  }
  if (data.creating) {
    // TODO check group etc
    if (viewer.wtMemberships.includes(data.discussion.groupId)) {
      // eslint-disable-line
      return (viewer.permissions & Permissions.MAKE_COMMENT) > 0;
    }
  }
  // eslint-disable-next-line eqeqeq
  return viewer.id && viewer.id == data.authorId;
}

/* eslint-enable no-unused-vars */

const ATypes = {
  WRITE: 1,
  READ: 2,
};
const accessFilter = {
  /* GENERATOR_FILTER */
  [Models.PHASE]: {
    [ATypes.WRITE]: phaseWriteControl,
    [ATypes.READ]: phaseReadControl,
  },
  [Models.ASSET]: {
    [ATypes.WRITE]: assetWriteControl,
    [ATypes.READ]: assetReadControl,
  },
  [Models.PLATFORM]: {
    [ATypes.WRITE]: platformWriteControl,
    [ATypes.READ]: platformReadControl,
  },
  [Models.TAG]: {
    [ATypes.WRITE]: tagWriteControl,
    [ATypes.READ]: tagReadControl,
  },
  [Models.REQUEST]: {
    [ATypes.WRITE]: requestWriteControl,
    [ATypes.READ]: requestReadControl,
  },
  [Models.USER]: {
    [ATypes.WRITE]: userWriteControl,
    [ATypes.READ]: userReadControl,
  },
  [Models.PROPOSAL]: {
    [ATypes.WRITE]: proposalWriteControl,
    [ATypes.READ]: proposalReadControl,
  },
  [Models.STATEMENT]: {
    [ATypes.WRITE]: statementWriteControl,
    [ATypes.READ]: statementReadControl,
  },
  [Models.FLAG]: {
    [ATypes.WRITE]: flagWriteControl,
    [ATypes.READ]: flagReadControl,
  },
  [Models.S_LIKE]: {
    [ATypes.WRITE]: stmtLikeWriteControl,
    [ATypes.READ]: stmtLikeReadControl,
  },
  [Models.POLL]: {
    [ATypes.WRITE]: pollWriteControl,
    [ATypes.READ]: pollReadControl,
  },
  [Models.VOTE]: {
    [ATypes.WRITE]: voteWriteControl,
    [ATypes.READ]: voteReadControl,
  },
  [Models.NOTIFICATION]: {
    [ATypes.WRITE]: notificationWriteControl,
    [ATypes.READ]: notificationReadControl,
  },
  [Models.ACTIVITY]: {
    [ATypes.WRITE]: activityWriteControl,
    [ATypes.READ]: activityReadControl,
  },
  [Models.GROUP]: {
    [ATypes.WRITE]: groupWriteControl,
    [ATypes.READ]: groupReadControl,
  },
  [Models.DISCUSSION]: {
    [ATypes.WRITE]: discussionWriteControl,
    [ATypes.READ]: discussionReadControl,
  },
  [Models.COMMENT]: {
    [ATypes.WRITE]: commentWriteControl,
    [ATypes.READ]: commentReadControl,
  },
};

export const canMutate = (viewer, data, model): boolean =>
  true || accessFilter[model][ATypes.WRITE](viewer, data);

export const canSee = (viewer, data, model): boolean =>
  true || accessFilter[model][ATypes.READ](viewer, data);

type PermissionErrorInfo = { viewer: {}, data?: {}, model: tModel };

export class PermissionError extends Error {
  info: PermissionErrorInfo;
  message: string;
  constructor(info: PermissionErrorInfo) {
    super();
    this.info = info;
    this.message = 'Permission error';
  }
}
