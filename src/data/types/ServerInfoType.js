import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
} from 'graphql';

const ServerInfoType = new ObjectType({
  name: 'ServerInfoType',

  fields: {
    numCpus: {
      type: GraphQLInt,
    },
    loadAvg: {
      type: new GraphQLList(GraphQLFloat),
    },
    memory: {
      type: new GraphQLList(GraphQLString),
    },

    uptime: {
      type: GraphQLInt,
    },
  },
});
export default ServerInfoType;
