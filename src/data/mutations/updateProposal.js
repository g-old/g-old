import { GraphQLNonNull } from 'graphql';
import ProposalInputType from '../types/ProposalInputType';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';
import { insertIntoFeed } from '../../core/feed';

const updateProposal = {
  type: new GraphQLNonNull(ProposalType),
  args: {
    proposal: {
      type: ProposalInputType,
    },
  },
  resolve: async (data, { proposal }, { viewer, loaders }) => {
    const updatedProposal = Proposal.update(viewer, proposal, loaders);
    if (updatedProposal) {
      await insertIntoFeed(
        {
          viewer,
          data: { type: 'proposal', objectId: updatedProposal.id, content: updatedProposal },
          verb: 'update',
        },
        true,
      );
    }
    return updatedProposal;
  },
};

export default updateProposal;
