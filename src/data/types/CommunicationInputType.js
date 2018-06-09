import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLBoolean,
} from 'graphql';

const CommunicationInputType = new GraphQLInputObjectType({
  name: 'CommunicationInput',
  fields: {
    id: {
      type: GraphQLID,
    },
    textHtml: {
      type: String,
    },

    replyable: {
      type: GraphQLBoolean,
    },
  },
});
export default CommunicationInputType;
