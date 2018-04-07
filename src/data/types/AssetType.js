import {
  GraphQLString as String,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';

import UserType from './UserType';

const AssetType = new ObjectType({
  name: 'Asset',
  fields: {
    id: {
      type: ID,
    },
    from: {
      type: UserType,
    },
    name: {
      type: String,
    },
    canDelete: {
      type: GraphQLBoolean,
    },
    source: {
      type: String,
    },
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
    deleteddAt: {
      type: String,
    },
  },
});

export default AssetType;
