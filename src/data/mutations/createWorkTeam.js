import { GraphQLNonNull } from 'graphql';
import WorkTeamInputType from '../types/WorkTeamInputType';
import WorkTeam from '../models/WorkTeam';
import WorkTeamType from '../types/WorkTeamType';

const createWorkTeam = {
  type: new GraphQLNonNull(WorkTeamType),
  args: {
    workTeam: {
      type: WorkTeamInputType,
    },
  },
  resolve: (data, { workTeam }, { viewer, loaders }) => WorkTeam.create(viewer, workTeam, loaders),
};

export default createWorkTeam;
