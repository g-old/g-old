import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLObjectType as ObjectType,
} from 'graphql';

const CommunicationType = new ObjectType({
  name: 'Communication',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    parentId: {
      type: GraphQLID,
    },

    textHtml: {
      type: GraphQLString,
    },

    textRaw: {
      type: GraphQLString,
    },

    replyable: {
      type: GraphQLBoolean,
    },

    createdAt: {
      type: GraphQLString,
    },
  }),
});
export default CommunicationType;
