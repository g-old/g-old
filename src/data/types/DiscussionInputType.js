import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';

const DiscussionInputType = new GraphQLInputObjectType({
  name: 'DiscussionInput',
  fields: {
    id: {
      type: ID,
    },
    groupId: {
      type: ID,
    },
    content: {
      type: String,
    },
    title: {
      type: String,
    },
  },
});
export default DiscussionInputType;
