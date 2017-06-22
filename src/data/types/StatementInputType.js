import { GraphQLString as String, GraphQLInputObjectType, GraphQLID as ID } from 'graphql';

const StatementInputType = new GraphQLInputObjectType({
  name: 'StatementInput',
  fields: {
    text: {
      type: String,
    },
    voteId: {
      type: ID,
    },
    pollId: {
      type: ID,
    },

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default StatementInputType;
