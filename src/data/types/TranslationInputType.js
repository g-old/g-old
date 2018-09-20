import { GraphQLString as String, GraphQLInputObjectType } from 'graphql';

const TranslationInputType = new GraphQLInputObjectType({
  name: 'TranslationInput',
  fields: {
    de: {
      type: String,
    },

    it: {
      type: String,
    },

    lld: {
      type: String,
    },
    _default: {
      type: String,
    },
  },
});
export default TranslationInputType;
