import { GraphQLNonNull } from 'graphql';
import WorkTeamInputType from '../types/WorkTeamInputType';
import WorkTeam from '../models/WorkTeam';
import WorkTeamType from '../types/WorkTeamType';

const leaveWorkTeam = {
  type: new GraphQLNonNull(WorkTeamType),
  args: {
    workTeam: {
      type: WorkTeamInputType,
    },
  },
  resolve: async (data, { workTeam }, { viewer, loaders }) => {
    const team = await WorkTeam.gen(viewer, workTeam.id, loaders);
    if (team) {
      return team.leave(viewer, workTeam.memberId, loaders);
    }
    return null;
  },
};

export default leaveWorkTeam;
