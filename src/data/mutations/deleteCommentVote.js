import { GraphQLNonNull } from 'graphql';
import CommentVoteInput from '../types/CommentVoteInputType';
import CommentType from '../types/CommentType';
import CommentVote from '../models/CommentVote';

const deleteCommentVote = {
  type: new GraphQLNonNull(CommentType),
  args: {
    commentVote: {
      type: CommentVoteInput,
      description: 'Delete commentVote',
    },
  },
  resolve: async (data, { commentVote }, { viewer, loaders }) => {
    const newCommentVote = await CommentVote.delete(
      viewer,
      commentVote,
      loaders,
    );
    return newCommentVote;
  },
};

export default deleteCommentVote;
