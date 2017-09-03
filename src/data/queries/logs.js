import { GraphQLList, GraphQLID } from 'graphql';

import LogType from '../types/LogType';
import Feed from '../models/Feed';

const logs = {
  type: new GraphQLList(LogType),
  args: {
    userId: {
      type: GraphQLID,
      description: 'Id to fetch activity log from',
    },
  },

  resolve: (parent, { userId }, { viewer, loaders }) =>
    Feed.gen(viewer, userId, loaders),
};

export default logs;
