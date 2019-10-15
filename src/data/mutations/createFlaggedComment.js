import { GraphQLNonNull, GraphQLID } from 'graphql';
import CommentType from '../types/CommentType';
import Comment from '../models/Comment';

const createFlaggedComment = {
  type: CommentType,
  args: {
    commentId: {
      type: GraphQLID,
    },
  },
  resolve: async (data, { commentId }, { viewer, loaders }) =>
    Comment.flag(viewer, { id: commentId }, loaders),
};

export default createFlaggedComment;
