import {
  GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
} from 'graphql';

const WorkTeamInputType = new GraphQLInputObjectType({
  name: 'WorkTeamInput',
  fields: {
    coordinatorId: {
      type: ID,
    },
    name: {
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
    main: {
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
export default WorkTeamInputType;
