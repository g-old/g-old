import { GraphQLNonNull, GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql';
import UserInputType from '../types/UserInputType';
import User from '../models/User';
import UserType from '../types/UserType';
import { sendJob } from '../../core/childProcess';
import log from '../../logger';
import { getProtocol } from '../../core/helpers';

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
  resolve: async (data, { user }, { viewer, loaders }) =>
    User.update(viewer, user, loaders, true).then((response) => {
      if (response.user) {
        if (user.email && user.email === response.user.email && !response.user.emailVerified) {
          const job = {
            type: 'mail',
            data: {
              lang: data.request.cookies.lang,
              mailType: 'mailChanged',
              address: response.user.email,
              viewer,
              connection: { host: data.request.headers.host, protocol: getProtocol(data.request) },
            },
          };
          if (!sendJob(job)) {
            log.error({ job }, 'Job not sent!');
          }
        }
      }
      return response;
    }),
};

export default updateUser;
