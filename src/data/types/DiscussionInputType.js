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
    workTeamId: {
      type: ID,
    },
    content: {
      type: String,
    },
    title: {
      type: String,
    },
    closedAt: {
      type: String,
    },
  },
});
export default DiscussionInputType;
