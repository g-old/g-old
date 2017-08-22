import { GraphQLNonNull } from 'graphql';
import ProposalInputType from '../types/ProposalInputType';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';
import { insertIntoFeed } from '../../core/feed';
import knex from '../knex';
import log from '../../logger';

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
          data: {
            type: 'proposal',
            objectId: updatedProposal.id,
            content: updatedProposal,
          },
          verb: 'update',
        },
        true,
      );
      if (activityId) {
        pubsub.publish('activities', { id: activityId });
      }

      if (['accepted', 'rejected', 'revoked'].indexOf(updateProposal.state)) {
        try {
          await knex('proposal_user_subscriptions')
            .where({ proposal_id: updatedProposal.id })
            .del();
        } catch (err) {
          log.error({ err }, 'Subscription deletion failed');
        }
      }
    }
    return updatedProposal;
  },
};

export default updateProposal;
