import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';


const proposals = {
  type: ProposalType,
  args: {
    id: {
      description: 'The proposals ID number',
      type: new GraphQLNonNull(GraphQLID),
    },
  },
  resolve: (parent, { id }, { viewer, loaders }) => Proposal.gen(viewer, id, loaders),
};


export default proposals;
