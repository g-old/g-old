import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID,
} from 'graphql';

const PushSubInput = new GraphQLInputObjectType({
  name: 'PushSubInput',
  fields: {
    endpoint: {
      type: String,
    },
    p256dh: {
      type: String,
    },
    auth: {
      type: String,
    },
    proposalId: {
      type: GraphQLID,
    },
  },
});
export default PushSubInput;
