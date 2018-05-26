import { GraphQLString, GraphQLObjectType as ObjectType } from 'graphql';

const TranslationType = new ObjectType({
  name: 'Translation',

  fields: () => ({
    de: {
      type: GraphQLString,
    },

    it: {
      type: GraphQLString,
    },

    lld: {
      type: GraphQLString,
    },
  }),
});
export default TranslationType;
