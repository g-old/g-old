import { GraphQLObjectType as ObjectType, GraphQLInt } from 'graphql';

import ResourceType from './ResourceStatusType';

const BucketInfoType = new ObjectType({
  name: 'BucketInfoType',

  fields: {
    objects: {
      type: ResourceType,
    },
    bandwidth: {
      type: ResourceType,
    },
    storage: {
      type: ResourceType,
    },

    requests: {
      type: GraphQLInt,
    },
  },
});
export default BucketInfoType;
