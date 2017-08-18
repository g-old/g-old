import { GraphQLList } from 'graphql';

import ActivityType from '../types/ActivityType';
import Feed from '../models/Feed';

const feed = {
  type: new GraphQLList(ActivityType),

  resolve: (parent, args, { viewer, loaders }) => Feed.gen(viewer, args, loaders),
};

export default feed;
