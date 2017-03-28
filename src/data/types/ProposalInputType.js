import { GraphQLString as String, GraphQLInputObjectType, GraphQLID as ID } from 'graphql';

const ProposalInputType = new GraphQLInputObjectType({
  name: 'ProposalInput',
  fields: {
    pollingModeId: {
      type: ID,
    },
    text: {
      type: String,
    },
    title: {
      type: String,
    },
    endTime: {
      type: String,
    },
    modeId: {
      type: ID,
    },
    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },
});
export default ProposalInputType;
