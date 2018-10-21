import {
  GraphQLString as String,
  GraphQLObjectType,
  GraphQLInt,
} from 'graphql';

import { buildLocalizedFieldResolver } from '../utils';

const descriptionResolver = buildLocalizedFieldResolver('description');
const titleResolver = buildLocalizedFieldResolver('title');

const OptionType = new GraphQLObjectType({
  name: 'OptionType',
  fields: {
    title: {
      type: String,
      resolve: titleResolver,
    },
    description: {
      type: String,
      resolve: descriptionResolver,
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
