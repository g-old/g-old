import { GraphQLNonNull, GraphQLID } from 'graphql';
import CommentInput from '../types/CommentInputType';
import CommentType from '../types/CommentType';
import Comment from '../models/Comment';
import Subscription, { SubscriptionType } from '../models/Subscription';
import { TargetType } from '../models/utils';

import WithSubscriptionResultType from '../types/WithSubscriptionResultType';

const createComment = {
  type: new GraphQLNonNull(new WithSubscriptionResultType(CommentType)),
  args: {
    comment: {
      type: CommentInput,
      description: 'Create a new comment',
    },
    targetId: {
      type: GraphQLID,
    },
  },
  resolve: async (data, { comment, targetId }, { viewer, loaders }) => {
    const newComment = await Comment.create(viewer, comment, loaders);
    let subscription;
    if (newComment && targetId) {
      subscription = await Subscription.create(
        viewer,
        {
          targetType: TargetType.DISCUSSION,
          targetId,
          subscriptionType: SubscriptionType.REPLIES,
        },
        loaders,
      );
    }
    return { resource: newComment, subscription };
  },
};

export default createComment;
