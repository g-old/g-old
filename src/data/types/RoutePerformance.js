import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLObjectType as ObjectType,
} from 'graphql';

const RoutePerformance = new ObjectType({
  name: 'RoutePerformance',

  fields: {
    type: {
      type: GraphQLString,
    },
    resource: {
      type: GraphQLString,
    },
    avgTime: {
      type: GraphQLFloat,
    },
    numRequests: {
      type: GraphQLInt,
    },
    medianTime: {
      type: GraphQLFloat,
    },
  },
});
export default RoutePerformance;
