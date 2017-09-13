import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLFloat,
} from 'graphql';

const ResourceStatusType = new ObjectType({
  name: 'ResourceStatusType',

  fields: {
    usage: { type: GraphQLString },
    limit: {
      type: GraphQLString,
    },
    usedPercent: {
      type: GraphQLFloat,
      resolve(data) {
        return data.used_percent;
      },
    },
  },
});
export default ResourceStatusType;
