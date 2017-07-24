import { GraphQLNonNull } from 'graphql';
import ProposalInputType from '../types/ProposalInputType';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';
import { sendJob } from '../../core/childProcess';
import log from '../../logger';
import { insertIntoFeed } from '../../core/feed';

const createProposal = {
  type: new GraphQLNonNull(ProposalType),
  args: {
    proposal: {
      type: ProposalInputType,
      description: 'Create a new Proposal',
    },
  },
  resolve: async (data, { proposal }, { viewer, loaders, pubsub }) => {
    const newProposal = await Proposal.create(viewer, proposal, loaders);

    if (newProposal) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: { type: 'proposal', content: newProposal, objectId: newProposal.id },
          verb: 'create',
        },
        true,
      );
      if (activityId) {
        pubsub.publish('activities', { id: activityId });
      }
      if (!sendJob({ type: 'webpush', data: newProposal })) {
        log.error(
          { viewer, job: { type: 'webpush', data: newProposal } },
          'Could not send job to worker',
        );
      }
    }

    return newProposal;
  },
};

export default createProposal;
