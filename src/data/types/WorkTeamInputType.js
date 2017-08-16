import { GraphQLString as String, GraphQLInputObjectType, GraphQLID as ID } from 'graphql';

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
  },
});
export default WorkTeamInputType;
