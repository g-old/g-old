import { GraphQLID, GraphQLNonNull } from 'graphql';

import WorkTeamType from '../types/WorkTeamType';
import WorkTeam from '../models/WorkTeam';

const workTeam = {
  type: WorkTeamType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
  },

  resolve: (root, { id }, { viewer, loaders }) =>
    WorkTeam.gen(viewer, id, loaders),
};

export default workTeam;
