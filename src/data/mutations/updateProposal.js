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
  resolve: async (data, { proposal }, { viewer, loaders, pubsub }) => {
    const updatedProposal = await Proposal.update(viewer, proposal, loaders);
    if (updatedProposal) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: { type: 'proposal', objectId: updatedProposal.id, content: updatedProposal },
          verb: 'update',
        },
        true,
      );
      if (activityId) {
        pubsub.publish('activities', { id: activityId });
      }
    }
    return updatedProposal;
  },
};

export default updateProposal;
