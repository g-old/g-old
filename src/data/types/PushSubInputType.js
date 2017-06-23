import { GraphQLString as String, GraphQLInputObjectType } from 'graphql';

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
  },
});
export default PushSubInput;
