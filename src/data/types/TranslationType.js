import { GraphQLString, GraphQLObjectType as ObjectType } from 'graphql';

const TranslationType = new ObjectType({
  name: 'Translation',

  fields: () => ({
    'de-DE': {
      type: GraphQLString,
    },

    'it-IT': {
      type: GraphQLString,
    },

    'lld-IT': {
      type: GraphQLString,
    },
  }),
});
export default TranslationType;
