import {
  Permissions,
  Groups,
  AccessMasks,
  PrivilegesSchema,
} from '../organization';
/* eslint-disable no-bitwise */
// TODO make object
export const Models = {
  USER: 1,
};

/* GENERATOR_FN */
/* eslint-disable no-unused-vars */

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

/* eslint-enable no-unused-vars */

const ATypes = {
  WRITE: 1,
  READ: 2,
};
const accessFilter = {
  /* GENERATOR_FILTER */

  [Models.USER]: {
    [ATypes.WRITE]: userWriteControl,
    [ATypes.READ]: userReadControl,
  },
};

export const canMutate = (viewer, data, model) =>
  accessFilter[model][ATypes.WRITE](viewer, data);

export const canSee = (viewer, data, model) =>
  accessFilter[model][ATypes.READ](viewer, data);
