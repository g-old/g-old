import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLEnumType,
} from 'graphql';

export const PositionTypeEnum = new GraphQLEnumType({
  name: 'CommentPosition',
  values: {
    pro: {
      value: 'pro',
    },
    con: {
      value: 'con',
    },
  },
});
const CommentVoteType = new ObjectType({
  name: 'CommentVote',
  fields: {
    id: {
      type: ID,
    },
    position: {
      type: PositionTypeEnum,
    },
    userId: {
      type: ID,
    },
    commentId: {
      type: ID,
    },
  },
});

export default CommentVoteType;
