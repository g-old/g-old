import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';

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
    memberId: {
      type: ID,
      description: 'For mutations of members / admission of members',
    },
    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
    deName: {
      type: String,
    },
    itName: {
      type: String,
    },
    lldName: {
      type: String,
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
