import { GraphQLString, GraphQLBoolean, GraphQLObjectType } from 'graphql';

const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    startCursor: {
      type: GraphQLString,
    },

    endCursor: {
      type: GraphQLString,
    },

    hasNextPage: {
      type: GraphQLBoolean,
    },
  },
});

export default PageInfoType;
