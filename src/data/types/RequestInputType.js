import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';

const RequestInputType = new GraphQLInputObjectType({
  name: 'RequestInput',
  fields: {
    id: {
      type: ID,
    },
    type: {
      type: String,
    },
    content: {
      type: String,
    },
    processorId: {
      type: ID,
    },
    requesterId: {
      type: ID,
    },
    deny: {
      type: GraphQLBoolean,
    },
  },
});
export default RequestInputType;
