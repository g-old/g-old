import {
  GraphQLString as String,
  GraphQLObjectType,
  GraphQLInt,
} from 'graphql';

import { localeToLang } from '../utils';

const OptionType = new GraphQLObjectType({
  name: 'OptionType',
  fields: {
    description: {
      type: String,
      resolve: (parent, args, params, { rootValue }) => {
        const locale = rootValue.request.language;
        if (parent.description[localeToLang[locale]]) {
          return parent.description[localeToLang[locale]];
        }
        // find one translation that is not emty or default translation
        return Object.values(parent.description).find(t => t);
      },
    },
    pos: {
      type: GraphQLInt,
    },
    order: {
      type: GraphQLInt,
    },
    numVotes: {
      type: GraphQLInt,
    },
  },
});
export default OptionType;
