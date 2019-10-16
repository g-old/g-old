import { GraphQLInputObjectType, GraphQLID as ID } from 'graphql';
import { PositionTypeEnum } from './CommentVoteType';

const CommentVoteInputType = new GraphQLInputObjectType({
  name: 'CommentVoteInput',
  fields: {
    id: {
      type: ID,
    },
    position: {
      type: PositionTypeEnum,
    },
    commentId: {
      type: ID,
    },
  },
});
export default CommentVoteInputType;
