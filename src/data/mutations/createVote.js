import { GraphQLNonNull, GraphQLID } from 'graphql';
import VoteInputType from '../types/VoteInputType';
import Vote from '../models/Vote';
import VoteType from '../types/VoteDLType';
import Subscription, { SubscriptionType } from '../models/Subscription';
import { TargetType } from '../models/utils';

import WithSubscriptionResultType from '../types/WithSubscriptionResultType';

const createVote = {
  type: new GraphQLNonNull(WithSubscriptionResultType(VoteType)),
  args: {
    vote: {
      type: VoteInputType,
    },
    targetId: {
      type: GraphQLID,
    },
  },
  resolve: async (data, { vote, targetId }, { viewer, loaders }) => {
    const voteResult = await Vote.create(viewer, vote, loaders);
    let subscription;
    if (voteResult && targetId) {
      subscription = await Subscription.create(
        viewer,
        {
          targetType: TargetType.PROPOSAL,
          targetId,
          subscriptionType: SubscriptionType.UPDATES,
        },
        loaders,
      );
    }
    return {
      resource: voteResult,
      subscription,
    };
  },
};

export default createVote;
