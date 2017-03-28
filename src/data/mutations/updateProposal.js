import { GraphQLNonNull } from 'graphql';
import ProposalInputType from '../types/ProposalInputType';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';

const updateProposal = {
  type: new GraphQLNonNull(ProposalType),
  args: {
    proposal: {
      type: ProposalInputType,
    },
  },
  resolve: (data, { proposal }, { viewer, loaders }) => Proposal.update(viewer, proposal, loaders),
};

export default updateProposal;
