import knex from '../data/knex';
import log from '../logger';
import Proposal from '../data/models/Proposal';
import { computeNextState } from '../data/models/helpers';
import createLoaders from '../data/dataLoader';
import BotInstance from '../bot';

let workerBot;

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
    .where({ 'polls.deleted_at': null })
    .where('polls.end_time', '<=', new Date())
    .select(
      'proposals.id as id',
      'proposals.state as state',
      'proposals.poll_two_id as pollTwoId',
      'proposals.poll_one_id as pollOneId',
      'polls.closed_at as closedAt',
      'polls.threshold as threshold',
      'polls.options as options',
      'polls.extended as extended',
      'polls.num_voter as numVoter',
      'polling_modes.threshold_ref as ref',
    );
  let loaders = null;
  if (proposals.length > 0) {
    loaders = createLoaders();
    if (!workerBot) {
      workerBot = await BotInstance.getBot();
    }
  }
  const mutations = proposals.map(proposal => {
    // TODO in transaction!
    const newState = computeNextState(proposal.state, proposal, proposal.ref);
    return Proposal.update(
      workerBot,
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
