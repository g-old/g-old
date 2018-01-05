import { GraphQLNonNull } from 'graphql';
import WorkTeamInput from '../types/WorkTeamInputType';
import WorkTeamType from '../types/WorkTeamType';
import WorkTeam from '../models/WorkTeam';

const updateWorkTeam = {
  type: new GraphQLNonNull(WorkTeamType),
  args: {
    workTeam: {
      type: WorkTeamInput,
      description: 'Update workTeam',
    },
  },
  resolve: async (data, { workTeam }, { viewer, loaders }) => {
    const newWorkTeam = await WorkTeam.update(viewer, workTeam, loaders);
    return newWorkTeam;
  },
};

export default updateWorkTeam;
