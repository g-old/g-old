import { GraphQLNonNull } from 'graphql';
import PushSubInputType from '../types/PushSubInputType';
import log from '../../logger';
import Proposal from '../models/Proposal';
import ProposalType from '../types/ProposalDLType';

const deleteProposalSub = {
  type: new GraphQLNonNull(ProposalType),
  args: {
    subscription: {
      type: PushSubInputType,
      description: 'Subscription details from push service',
    },
  },
  resolve: async (data, { subscription }, { viewer, loaders }) => {
    try {
      if (!viewer.id) return false;

      // Proposal.subscribe(user)
      const proposal = await Proposal.gen(
        viewer,
        subscription.proposalId,
        loaders,
      );
      if (!proposal) return null;
      await proposal.unSubscribe(viewer);
      return Proposal.gen(viewer, subscription.proposalId, loaders);
    } catch (err) {
      log.error(
        { subInfo: { err, sub: subscription, viewer } },
        'Deleting subscription failed',
      );

      return null;
    }
  },
};

export default deleteProposalSub;
