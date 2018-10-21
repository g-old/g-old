import { GraphQLInputObjectType, GraphQLInt } from 'graphql';

import TranslationInputType from './TranslationInputType';

const OptionInputType = new GraphQLInputObjectType({
  name: 'OptionInput',
  fields: {
    pos: {
      type: GraphQLInt,
    },
    order: {
      type: GraphQLInt,
    },
    description: {
      type: TranslationInputType,
    },
    title: {
      type: TranslationInputType,
    },
  },
});
export default OptionInputType;
