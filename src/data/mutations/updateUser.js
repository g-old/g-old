import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import UserInputType from '../types/UserInputType';
import User from '../models/User';
import UserType from '../types/UserType';
// import { sendJob } from '../../core/childProcess';
// import log from '../../logger';
// import { getProtocol } from '../../core/helpers';
// import { Groups } from '../../organization';
// import { EmailTypes } from '../../core/BackgroundService';

const updateSession = (req, user) =>
  new Promise((resolve, reject) =>
    // eslint-disable-next-line no-confusing-arrow
    req.login(user, err => (err ? reject(err) : resolve(user))),
  ).then(
    () =>
      new Promise((resolve, reject) =>
        // eslint-disable-next-line no-confusing-arrow
        req.session.save(err => (err ? reject(err) : resolve())),
      ),
  );

/* eslint-disable no-bitwise */
/* const getUpdatedGroup = (oldGroups, updatedGroups) => {
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

  return { added, names: groups };
}; */
/* eslint-enable no-bitwise */
/*
const notifyRoleChange = (viewer, user, message) => {
  const job = {
    type: 'notification',
    data: {
      receiver: { type: 'user', id: user.id },
      viewer,
      notificationType: 'msg', // TODO not hardcode
      msg: message.body,
      title: message.subject,
    },
  };
  return sendJob(job);
};
*/
const updateUser = {
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'UpdateUserResult',
      fields: {
        errors: { type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
        user: { type: UserType },
      },
    }),
  ), // UserType, // new GraphQLNonNull(UserType),
  args: {
    user: {
      type: UserInputType,
    },
  },
  resolve: async (data, { user }, { viewer, loaders }) => {
    const result = await User.update(viewer, user, loaders, data.request); // request for emailChange
    if (result.user) {
      if (user.groups) {
        // TODO better check!

        if (result.oldUser) {
          // TODO implement message compatible variant
          /* const groups = getUpdatedGroup(
            result.oldUser.groups,
            result.user.groups,
          );
          notifyRoleChange(viewer, result.user, {
            subject: 'Group memberships changed',
            body: `Your group memberships got changed. ${
              groups.added
                ? `Congratulations ${
                    result.user.name
                  }, you are now member of the group ${groups.names.join(',')}`
                : `You got removed from the group ${groups.names.join(',')}`
            }`,
          }); */
          delete result.oldUser;
        }
      }
      // TODO check if necessary
      if (viewer.id === result.user.id) {
        await updateSession(data.request, result.user);
      }
    }
    return result;
  },
};

export default updateUser;
