import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';

import PrivacyType from './PrivacyType';

const GroupInputType = new GraphQLInputObjectType({
  name: 'GroupInput',
  fields: {
    coordinatorId: {
      type: ID,
    },
    parentGroupId: {
      type: ID,
    },
    names: {
      type: String,
    },
    privacy: {
      type: PrivacyType,
    },
    goldMode: {
      type: GraphQLBoolean,
    },

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
    restricted: {
      type: GraphQLBoolean,
    },
    mainTeam: {
      type: GraphQLBoolean,
    },
    logoAssetId: {
      type: ID,
    },
    backgroundAssetId: {
      type: ID,
    },
  },
});
export default GroupInputType;
