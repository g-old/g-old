import { GraphQLNonNull } from 'graphql';
import ProposalInputType from '../types/ProposalInputType';
import ProposalType from '../types/ProposalDLType';
import Proposal from '../models/Proposal';
import { sendJob } from '../../core/childProcess';
import log from '../../logger';

const createProposal = {
  type: new GraphQLNonNull(ProposalType),
  args: {
    proposal: {
      type: ProposalInputType,
      description: 'Create a new Proposal',
    },
  },
  resolve: (data, { proposal }, { viewer, loaders }) =>
    Proposal.create(viewer, proposal, loaders)
      .then((p) => {
        if (p) {
          Proposal.insertInFeed(viewer, p, 'create');
        }
        return p;
      })
      .then((p) => {
        if (p) {
          if (!sendJob({ type: 'webpush', data: p })) {
            log.error(
              { viewer, job: { type: 'webpush', data: p } },
              'Could not send job to worker',
            );
          }
        }
        return p;
      }), // Proposal.pushToUsers(viewer, p)),
};

export default createProposal;
