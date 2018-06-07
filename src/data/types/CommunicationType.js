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

    textRaw: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
      resolve: parent => parent.textHtml || parent.textRaw,
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
