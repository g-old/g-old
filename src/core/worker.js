import knex from '../data/knex';

async function proposalPolling() {
  const proposals = await knex('proposals')
    .where({ state: 'voting' })
    .where('end_time', '<=', new Date())
    .innerJoin('polls', 'proposals.poll_two_id', 'polls.id')
    .innerJoin('polling_modes', 'polls.polling_mode_id', 'polling_modes.id')
    .select(
      'proposals.id as id',
      'proposals.poll_two_id as pollTwoId',
      'polls.threshold as threshold',
      'polls.upvotes as upvotes',
      'polls.downvotes as downvotes',
      'polls.num_voter',
      'polling_modes.threshold_ref as ref',
    );

  const mutations = proposals.map((proposal) => {
    let newState;
    let ref;
    switch (proposal.ref) {
      case 'voters':
        ref = proposal.upvotes + proposal.downvotes;
        break;
      case 'all':
        ref = proposal.num_voter;
        break;

      default:
        throw Error(`Threshold reference not implemented: ${proposal.ref}`);
    }

    ref *= proposal.threshold / 100;

    if (proposal.upvotes >= ref) {
      newState = 'accepted';
    } else {
      newState = 'rejected';
    }
    // TODO in transaction!
    return knex('proposals')
      .where({ id: proposal.id })
      .update({ state: newState, updated_at: new Date() })
      .then(() =>
        knex('polls')
          .where({ id: proposal.pollTwoId })
          .update({ closed_at: new Date(), updated_at: new Date() }),
      );
  });

  await Promise.all(mutations);

  // workerFn();
}

const worker = async () => {
  console.log('working...');
  try {
    proposalPolling(worker);
  } catch (e) {
    console.log(e);
  }
  setTimeout(() => {
    worker();
  }, 10000);
};

export default worker;
