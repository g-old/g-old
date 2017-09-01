import {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import UserInputType from '../types/UserInputType';
import User from '../models/User';
import UserType from '../types/UserType';
import { sendJob } from '../../core/childProcess';
import log from '../../logger';
import { getProtocol } from '../../core/helpers';

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
    const result = await User.update(viewer, user, loaders, true);
    if (result.user) {
      // log user in or save session
      if (
        user.email &&
        user.email === result.user.email &&
        !result.user.emailVerified
      ) {
        const job = {
          type: 'mail',
          data: {
            lang: data.request.cookies.lang,
            mailType: 'mailChanged',
            address: result.user.email,
            viewer,
            connection: {
              host: data.request.hostname,
              protocol: getProtocol(data.request),
            },
          },
        };
        if (!sendJob(job)) {
          log.error({ job }, 'Job not sent!');
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
