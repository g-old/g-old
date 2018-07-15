import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
/* eslint-disable import/no-cycle */
import ProposalType from './ProposalDLType';
/* eslint-enable import/no-cycle */

import Proposal from '../models/Proposal';

const ProposalStatusType = new ObjectType({
  name: 'ProposalStatus',

  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    proposal: {
      type: ProposalType,
      resolve: async (data, args, { viewer, loaders }) => {
        const proposal = await Proposal.gen(viewer, data.proposal_id, loaders);
        if (proposal.deletedAt) {
          return { id: proposal.id, deletedAt: proposal.deletedAt };
        }
        return proposal;
      },
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
