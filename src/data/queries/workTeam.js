import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

import WorkTeamType from '../types/WorkTeamType';
import WorkTeam from '../models/WorkTeam';

const workTeam = {
  type: WorkTeamType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    proposalState: {
      type: GraphQLString,
    },
  },

  resolve: async (root, args, { viewer, loaders }) => {
    const workTeamResult = await WorkTeam.gen(viewer, args.id, loaders);
    if (workTeamResult) {
      if (workTeamResult.deletedAt) {
        return {
          id: workTeamResult.id,
          name: workTeamResult.name,
          coordinatorId: workTeamResult.coordinatorId,
          deletedAt: workTeamResult.deletedAt,
        };
      }
      workTeamResult.args = args; // TODO change query
    }
    return workTeamResult;
  },
};

export default workTeam;
