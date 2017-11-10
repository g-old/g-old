import { GraphQLNonNull } from 'graphql';
import CommentInputType from '../types/CommentInputType';
import CommentType from '../types/CommentType';
import Comment from '../models/Comment';
// import { insertIntoFeed } from '../../core/feed';

const updateComment = {
  type: new GraphQLNonNull(CommentType),
  args: {
    comment: {
      type: CommentInputType,
    },
  },
  resolve: async (data, { comment }, { viewer, loaders }) => {
    const updatedComment = await Comment.update(viewer, comment, loaders);
    /* if (updatedComment) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: { type: 'comment', objectId: updatedComment.id, content: updatedComment },
          verb: 'update',
        },
        false, // dont insert updates into system feed
      );
      if (activityId) {
        pubsub.publish('activities', { id: activityId });
      }
    } */
    return updatedComment;
  },
};

export default updateComment;
