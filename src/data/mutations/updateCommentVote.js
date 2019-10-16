import { GraphQLNonNull } from 'graphql';
import CommentVoteInput from '../types/CommentVoteInputType';
import CommentType from '../types/CommentType';
import CommentVote from '../models/CommentVote';

const updateCommentVote = {
  type: new GraphQLNonNull(CommentType),
  args: {
    commentVote: {
      type: CommentVoteInput,
      description: 'Update commentVote',
    },
  },
  resolve: async (data, { commentVote }, { viewer, loaders }) => {
    const newCommentVote = await CommentVote.update(
      viewer,
      commentVote,
      loaders,
    );
    return newCommentVote;
  },
};

export default updateCommentVote;
