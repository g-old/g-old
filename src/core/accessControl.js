import {
  Permissions,
  Groups,
  AccessMasks,
  PrivilegesSchema,
  PermissionsSchema,
  isCoordinator,
} from '../organization';
/* eslint-disable no-bitwise */
// TODO make object
export const Models = {
  USER: 1,
  PROPOSAL: 2,
  STATEMENT: 4,
  FLAG: 8,
  S_LIKE: 16,
  POLL: 32,
  VOTE: 64,
  NOTIFICATION: 128,
  WORKTEAM: 256,
  ACTIVITY: 512,
  DISCUSSION: 1024,
  COMMENT: 2048,
  REQUEST: 4096,
  TAG: 8192,
  MESSAGE: 16384,
  NOTE: 32768,
  COMMUNICATION: 65536,
};

/* GENERATOR_FN */
/* eslint-disable no-unused-vars */
function communicationReadControl(viewer, data) {
  console.error('Access control for Communication not implemented');
  return true;
}
function communicationWriteControl(viewer, data) {
  console.error('Access control for Communication not implemented');
  return true;
}
function noteReadControl(viewer, data) {
  console.error('Access control for Note not implemented');
  return true;
}
function noteWriteControl(viewer, data) {
  console.error('Access control for Note not implemented');
  return true;
}
function notificationReadControl(viewer, data) {
  console.error('Access control for Notification not implemented');
  return true;
}
function notificationWriteControl(viewer, data) {
  console.error('Access control for Notification not implemented');
  return true;
}
function subscriptionReadControl(viewer, data) {
  console.error('Access control for Subscription not implemented');
  return true;
}
function subscriptionWriteControl(viewer, data) {
  console.error('Access control for Subscription not implemented');
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
    if (resource.workTeamId) {
      // assumes there exist only workteams
      if (viewer.groups & Groups.SYSTEM) {
        return true;
      }
      return (
        viewer.wtMemberships &&
        viewer.wtMemberships.includes(resource.workTeamId)
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
    if (data.groups == null) {
      return true; // Nobody can change his own memberships
    }
  }
  if ((viewer.groups & Groups.SYSTEM) > 0) {
    // to set email as verified, reset password,
    if (data.email || data.password) {
      return true;
    }
  }
  if (viewer.permissions & Permissions.MUTATE_PROFILES) {
    if (data.thumbnail || data.dataUrl || data.name || data.surname) {
      return true;
    }
    if (data.groups != null) {
      if (
        viewer.privileges &
        (PrivilegesSchema[Groups.ADMIN] | PrivilegesSchema[Groups.SUPER_USER])
      ) {
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
    viewer.id == data.id ||
    viewer.groups === Groups.SYSTEM ||
    (viewer.permissions & AccessMasks.LEVEL_1) > 0
  );
}

function proposalReadControl(viewer, data) {
  if (viewer.permissions & Permissions.VIEW_PROPOSALS) {
    return checkIfMember(viewer, data);
  }
  return false;
}

function proposalWriteControl(viewer, data) {
  if (data.workTeam && data.workTeam.deletedAt) {
    return false;
  }
  if (data.workTeamId) {
    if (isCoordinator(viewer, data.workTeam)) {
      return true;
    }
    return (viewer.groups & Groups.ADMIN) > 0;
  }

  if (viewer.groups & Groups.RELATOR) {
    if (data.id && data.state) {
      // updates
      if (viewer.permissions & Permissions.MODIFY_PROPOSALS) {
        return true;
      }
      return false;
    }
    return true;
  }
  if (data.state === 'survey') {
    if (viewer.permissions & Permissions.PUBLISH_SURVEYS) {
      return true;
    }
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
  if (data.proposal.deletedAt) {
    return false;
  }
  if (
    data.proposal.state === 'survey' &&
    viewer.permissions & Permissions.TAKE_SURVEYS
  ) {
    return checkIfMember(viewer, data.proposal);
  }
  if (viewer.permissions & Permissions.MODIFY_OWN_STATEMENTS) {
    return checkIfMember(viewer, data.proposal);
  }
  // To allow viewes in workteams to write statements
  if (data.proposal.workTeamId && viewer.groups & Groups.VIEWER) {
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
  if (viewer.permissions & PermissionsSchema[Groups.RELATOR]) {
    if (data.closedAt) {
      if (viewer.permissions & Permissions.CLOSE_POLLS) {
        return true;
      }
      return false;
    }
    return true;
  }
  if (isCoordinator(viewer, data.workTeam)) {
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
  } else if (
    (data.proposal.workTeamId && viewer.groups & Groups.VIEWER) ||
    viewer.permissions & Permissions.VOTE
  ) {
    return checkIfMember(viewer, data.proposal);
  }
  return false;
}

function messageReadControl(viewer, data) {
  if (viewer.permissions & AccessMasks.LEVEL_0) {
    // eslint-disable-next-line eqeqeq
    if (data.sender_id == viewer.id) {
      return true;
    }
    if (data.recipient_type === 'all') {
      return (viewer.groups & Groups.VIEWER) > 0;
    }
    if (data.recipient_type === 'group') {
      // check if same group
      return data.recipients.some(id =>
        viewer.wtMemberships.includes(Number(id)),
      );
    }
    if (data.recipient_type === 'user') {
      // eslint-disable-next-line eqeqeq
      return data.recipients.some(id => id == viewer.id);
    }
    // Atm misused for guests
    if (data.recipient_type === 'role') {
      // eslint-disable-next-line eqeqeq
      return viewer.groups === Groups.GUEST;
    }
  }
  return false;
}
function messageWriteControl(viewer, data) {
  if (data.workTeam && data.workTeam.deletedAt) {
    return false;
  }
  if (viewer.permissions & Permissions.NOTIFY_ALL) {
    return true;
  }

  if (data.isReply || isCoordinator(viewer, data.workTeam)) {
    return true;
  }
  if (viewer.groups & Groups.VIEWER) {
    // member can contact coordinator
    if (data.workTeamIds) {
      if (data.workTeamIds.some(wtId => viewer.wtMemberships.includes(wtId))) {
        return true;
      }
    }
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

function workTeamReadControl(viewer, data) {
  if (viewer.permissions & AccessMasks.LEVEL_0) {
    return true;
  }
  return false;
}
function workTeamWriteControl(viewer, data) {
  if (viewer.permissions & Permissions.CREATE_WORKTEAMS) {
    if (data.coordinatorId || data.name) {
      if (viewer.permissions & Permissions.CREATE_WORKTEAMS) {
        return true;
      }
      return false;
    }
    return true;
  }
  return false;
}

function discussionReadControl(viewer, data) {
  if (viewer.wtMemberships.includes(data.work_team_id)) {
    return true;
  }
  return false;
}
function discussionWriteControl(viewer, data) {
  if (data.workTeam && data.workTeam.deletedAt) {
    return false;
  }
  if (data.workTeamId) {
    if (
      data.mainTeam &&
      viewer.wtMemberships.includes(Number(data.workTeamId))
    ) {
      return true;
    }
    if (isCoordinator(viewer, data.workTeam)) {
      return true;
    }
    return viewer.permissions & PermissionsSchema[Groups.ADMIN];
  }
  if (viewer.permissions & Permissions.PUBLISH_DISCUSSIONS) {
    return true;
  }
  return false;
}
function commentReadControl(viewer, data) {
  if (viewer.wtMemberships.includes(data.discussion.workTeamId)) {
    // eslint-disable-line
    return true;
  }
  return false;
}
function commentWriteControl(viewer, data) {
  if (data.delete && viewer.groups & Groups.ADMIN) {
    return true;
  }

  if (data.discussion.closedAt || data.discussion.deletedAt) {
    return false;
  }
  if (data.creating) {
    // TODO check group etc
    if (viewer.wtMemberships.includes(data.discussion.workTeamId)) {
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
  [Models.COMMUNICATION]: {
    [ATypes.WRITE]: communicationWriteControl,
    [ATypes.READ]: communicationReadControl,
  },
  [Models.NOTE]: {
    [ATypes.WRITE]: noteWriteControl,
    [ATypes.READ]: noteReadControl,
  },
  [Models.NOTIFICATION]: {
    [ATypes.WRITE]: notificationWriteControl,
    [ATypes.READ]: notificationReadControl,
  },
  [Models.SUBSCRIPTION]: {
    [ATypes.WRITE]: subscriptionWriteControl,
    [ATypes.READ]: subscriptionReadControl,
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
  [Models.MESSAGE]: {
    [ATypes.WRITE]: messageWriteControl,
    [ATypes.READ]: messageReadControl,
  },
  [Models.ACTIVITY]: {
    [ATypes.WRITE]: activityWriteControl,
    [ATypes.READ]: activityReadControl,
  },
  [Models.WORKTEAM]: {
    [ATypes.WRITE]: workTeamWriteControl,
    [ATypes.READ]: workTeamReadControl,
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

export const canMutate = (viewer, data, model) =>
  accessFilter[model][ATypes.WRITE](viewer, data);

export const canSee = (viewer, data, model) =>
  accessFilter[model][ATypes.READ](viewer, data);
