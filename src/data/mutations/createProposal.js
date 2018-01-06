import { GraphQLNonNull } from 'graphql';
import ProposalInputType from '../types/ProposalInputType';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';

const createProposal = {
  type: new GraphQLNonNull(ProposalType),
  args: {
    proposal: {
      type: ProposalInputType,
      description: 'Create a new Proposal',
    },
  },
  resolve: async (data, { proposal }, { viewer, loaders }) =>
    Proposal.create(viewer, proposal, loaders),
};

export default createProposal;
