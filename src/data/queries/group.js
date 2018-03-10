import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

import GroupType from '../types/GroupType';
import Group from '../models/Group';

const group = {
  type: GroupType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    proposalState: {
      type: GraphQLString,
    },
  },

  resolve: async (root, args, { viewer, loaders }) => {
    const groupResult = await Group.gen(viewer, args.id, loaders);
    if (groupResult) {
      groupResult.args = args; // TODO change query
    }
    return groupResult;
  },
};

export default group;
