import { GraphQLID } from 'graphql';

import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';

const proposal = {
  type: ProposalType,
  args: {
    id: {
      description: 'The proposals ID number',
      type: GraphQLID,
    },
    pollId: {
      description: 'The ID of a poll associated with the proposal ',
      type: GraphQLID,
    },
  },
  resolve: async (parent, { id, pollId }, { viewer, loaders }) => {
    let result;
    if (id) {
      result = await Proposal.gen(viewer, id, loaders);
    } else if (pollId) {
      result = await Proposal.genByPoll(viewer, pollId, loaders);
    }
    if (result.deletedAt) {
      return {
        id: result.id,
        workteamId: result.workteamId,
        deletedAt: result.deletedAt,
      };
    }
    return result;
  },
};

export default proposal;
