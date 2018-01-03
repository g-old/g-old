import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
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
  },
});
export default RequestInputType;
