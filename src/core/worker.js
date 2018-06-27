import knex from '../data/knex';
import log from '../logger';
import Proposal, { computeNextState } from '../data/models/Proposal';
import createLoaders from '../data/dataLoader';
import { Permissions, Groups } from '../organization';

/* eslint-disable no-bitwise */
const SYSTEM = {
  id: 1,
  permissions:
    Permissions.MODIFY_PROPOSALS |
    Permissions.CLOSE_POLLS |
    Permissions.VIEW_PROPOSALS,
  groups: Groups.SYSTEM,
};
/* eslint-enable no-bitwise */

async function proposalPolling() {
  const proposals = await knex('proposals')
    .innerJoin('polls', function() {
      this.on(function() {
        this.on(
          knex.raw(
            "(proposals.state = 'proposed' and proposals.poll_one_id = polls.id) or (proposals.state = 'voting' and proposals.poll_two_id = polls.id) or(proposals.state = 'survey' and proposals.poll_one_id = polls.id)",
          ),
        );
      });
    })
    .innerJoin('polling_modes', 'polls.polling_mode_id', 'polling_modes.id')
    .where({ 'polls.closed_at': null })
    .where('polls.end_time', '<=', new Date())
    .select(
      'proposals.id as id',
      'proposals.state as state',
      'proposals.poll_two_id as pollTwoId',
      'proposals.poll_one_id as pollOneId',
      'polls.closed_at as closedAt',
      'polls.threshold as threshold',
      'polls.upvotes as upvotes',
      'polls.downvotes as downvotes',
      'polls.num_voter as numVoter',
      'polling_modes.threshold_ref as ref',
    );
  let loaders = null;
  if (proposals.length > 0) {
    loaders = createLoaders();
  }
  const mutations = proposals.map(proposal => {
    // TODO in transaction!
    const newState = computeNextState(proposal.state, proposal, proposal.ref);
    return Proposal.update(
      SYSTEM,
      { id: proposal.id, state: newState },
      loaders,
    ).catch(err => {
      log.error({ err, proposal }, 'Proposal update failed');
    });
  });

  return Promise.all(mutations);

  // workerFn();
}

const worker = async () => {
  try {
    proposalPolling();
  } catch (err) {
    log.error({ err }, 'Worker failed ');
  }
  setTimeout(() => {
    worker();
  }, 10000);
};

export default worker;
