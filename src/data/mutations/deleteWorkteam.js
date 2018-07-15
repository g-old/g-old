import { GraphQLNonNull } from 'graphql';
import WorkTeamInputType from '../types/WorkTeamInputType';
import WorkTeam from '../models/WorkTeam';
import WorkTeamType from '../types/WorkTeamType';

const deleteWorkteam = {
  type: new GraphQLNonNull(WorkTeamType),
  args: {
    workteam: {
      type: WorkTeamInputType,
    },
  },
  resolve: (data, { workteam }, { viewer, loaders }) =>
    WorkTeam.delete(viewer, workteam, loaders),
};

export default deleteWorkteam;
