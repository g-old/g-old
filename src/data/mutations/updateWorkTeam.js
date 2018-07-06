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
    if (workTeam && 'closing' in workTeam) {
      if (workTeam.closing) {
        return WorkTeam.deactivate(viewer, workTeam, loaders);
      }
      return WorkTeam.activate(viewer, workTeam, loaders);
    }
    const updatedWorkTeam = await WorkTeam.update(viewer, workTeam, loaders);
    return updatedWorkTeam;
  },
};

export default updateWorkTeam;
