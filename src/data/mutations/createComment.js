import { GraphQLNonNull } from 'graphql';
import CommentInput from '../types/CommentInputType';
import CommentType from '../types/CommentType';
import Comment from '../models/Comment';
// import { sendJob } from '../../core/childProcess';
// import log from '../../logger';
// import { insertIntoFeed } from '../../core/feed';

const createComment = {
  type: new GraphQLNonNull(CommentType),
  args: {
    comment: {
      type: CommentInput,
      description: 'Create a new comment',
    },
  },
  resolve: async (data, { comment }, { viewer, loaders }) => {
    const newComment = await Comment.create(viewer, comment, loaders);
    /*
    if (newComment) {
      const activityId = await insertIntoFeed(
        {
          viewer,
          data: {
            type: 'comment',
            content: newComment,
            objectId: newComment.id,
          },
          verb: 'create',
        },
        true,
      );
      if (activityId) {
        pubsub.publish('activities', { id: activityId });
      }
      if (!sendJob({ type: 'webpush', data: newComment })) {
        log.error(
          { viewer, job: { type: 'webpush', data: newComment } },
          'Could not send job to worker',
        );
      }
    }
*/
    return newComment;
  },
};

export default createComment;
