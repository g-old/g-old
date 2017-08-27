import knex from '../data/knex';
import { insertIntoFeed } from './feed';
import log from '../logger';
import Proposal from '../data/models/Proposal';
import createLoaders from '../data/dataLoader';

export const computeNextState = (state, poll, tRef) => {
  let newState;
  let ref;

  switch (tRef) {
    case 'voters':
      ref = poll.upvotes + poll.downvotes;
      break;
    case 'all':
      ref = poll.numVoter;
      break;

    default:
      throw Error(`Threshold reference not implemented: ${tRef}`);
  }

  ref *= poll.threshold / 100;

  if (poll.upvotes >= ref) {
    switch (state) {
      case 'proposed': {
        newState = 'proposed';
        break;
      }
      case 'voting': {
        newState = 'accepted';
        break;
      }
      case 'survey': {
        newState = 'survey';
        break;
      }

      default:
        throw Error(`State not recognized: ${state}`);
    }
  } else {
    switch (state) {
      case 'proposed': {
        newState = 'accepted';
        break;
      }
      case 'voting': {
        newState = 'rejected';
        break;
      }
      case 'survey': {
        newState = 'survey';
        break;
      }

      default:
        throw Error(`State not recognized: ${state}`);
    }
  }

  return newState;
};

async function proposalPolling(pubsub) {
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
      { id: 1, role: { type: 'system' } },
      { id: proposal.id, state: newState },
      loaders,
    )
      .then(proposalData => {
        if (proposalData) {
          return insertIntoFeed(
            {
              viewer: { id: 0, role: { type: 'system' } },
              data: {
                type: 'proposal',
                content: proposalData,
                objectId: proposalData.id,
              },
              verb: 'update',
            },
            true,
          )
            .then(activityId => {
              if (activityId) {
                return pubsub.publish('activities', { id: activityId });
              }
              return Promise.reject();
            })
            .catch(err => {
              log.error({ err }, 'Feed insertion failed -worker- ');
            });
        }
        return Promise.reject('Proposal update failed');
      })
      .catch(err => {
        log.error({ err, proposal }, 'Proposal update failed');
      });
  });

  return Promise.all(mutations);

  // workerFn();
}

const worker = async pubsub => {
  try {
    proposalPolling(pubsub);
  } catch (err) {
    log.error({ err }, 'Worker failed ');
  }
  setTimeout(() => {
    worker(pubsub);
  }, 10000);
};

export default worker;
