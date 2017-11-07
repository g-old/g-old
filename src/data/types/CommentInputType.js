import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';

const CommentInputType = new GraphQLInputObjectType({
  name: 'CommentInput',
  fields: {
    id: {
      type: ID,
    },
    discussionId: {
      type: ID,
    },
    content: {
      type: String,
    },
    parentId: {
      type: ID,
      description: 'Must be provided if reply',
    },
  },
});
export default CommentInputType;
