import { GraphQLNonNull } from 'graphql';
import CommentVoteInput from '../types/CommentVoteInputType';
import CommentType from '../types/CommentType';
import CommentVote from '../models/CommentVote';

const createCommentVote = {
  type: new GraphQLNonNull(CommentType),
  args: {
    commentVote: {
      type: CommentVoteInput,
      description: 'Create a new commentVote',
    },
  },
  resolve: async (data, { commentVote }, { viewer, loaders }) => {
    const newCommentVote = await CommentVote.create(
      viewer,
      commentVote,
      loaders,
    );
    return newCommentVote;
  },
};

export default createCommentVote;
