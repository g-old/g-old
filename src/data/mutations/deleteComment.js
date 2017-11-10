import { GraphQLNonNull } from 'graphql';
import CommentInputType from '../types/CommentInputType';
import CommentType from '../types/CommentType';
import Comment from '../models/Comment';
// import { insertIntoFeed } from '../../core/feed';

const deleteComment = {
  type: new GraphQLNonNull(CommentType),
  args: {
    comment: {
      type: CommentInputType,
    },
  },
  resolve: async (data, { comment }, { viewer, loaders }) => {
    const deletedComment = await Comment.delete(viewer, comment, loaders);
    /* if (deletedComment) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: { type: 'comment', objectId: deletedComment.id, content: deletedComment },
          verb: 'update',
        },
        false, // dont insert updates into system feed
      );
      if (activityId) {
        pubsub.publish('activities', { id: activityId });
      }
    } */
    return deletedComment;
  },
};

export default deleteComment;
