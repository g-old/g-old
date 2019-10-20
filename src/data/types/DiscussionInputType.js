import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';

const DiscussionInputType = new GraphQLInputObjectType({
  name: 'DiscussionInput',
  fields: {
    id: {
      type: ID,
    },
    workteamId: {
      type: ID,
    },
    content: {
      type: String,
    },
    title: {
      type: String,
    },
    close: {
      type: GraphQLBoolean,
    },
  },
});
export default DiscussionInputType;
