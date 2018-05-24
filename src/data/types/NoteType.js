import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType as ObjectType,
} from 'graphql';

const NoteType = new ObjectType({
  name: 'Note',

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

    content: {
      type: GraphQLString,
    },

    createdAt: {
      type: GraphQLString,
    },
  }),
});
export default NoteType;
