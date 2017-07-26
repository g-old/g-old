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
  resolve: (parent, { id, pollId }, { viewer, loaders }) => {
    if (id) {
      return Proposal.gen(viewer, id, loaders);
    }
    return Proposal.genByPoll(viewer, pollId, loaders);
  },
};

export default proposal;
