import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import Proposal from '../models/Proposal';
import ProposalType from './ProposalDLType';

const ProposalStatusType = new ObjectType({
  name: 'ProposalStatus',

  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    proposal: {
      type: ProposalType,
      resolve: (data, args, { viewer, loaders }) =>
        Proposal.gen(viewer, data.proposal_id, loaders),
    },
    state: {
      type: GraphQLString,
    },
    groupId: {
      type: GraphQLID,
      resolve: data => data.group_id,
    },
    groupType: {
      type: GraphQLString,
      resolve: data => data.group_type,
    },
    createdAt: {
      type: GraphQLString,
      resolve: data => data.created_at,
    },
  },
});
export default ProposalStatusType;
