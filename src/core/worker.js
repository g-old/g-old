import knex from '../data/knex';
import { insertIntoFeed } from './feed';
import log from '../logger';

async function proposalPolling(pubsub) {
  const proposals = await knex('proposals')
    .innerJoin('polls', function () {
      this.on(function () {
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
      switch (proposal.state) {
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
          throw Error(`State not recognized: ${proposal.state}`);
      }
    } else {
      switch (proposal.state) {
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
          throw Error(`State not recognized: ${proposal.state}`);
      }
    }
    // TODO in transaction!

    return knex('proposals')
      .where({ id: proposal.id })
      .update({ state: newState, updated_at: new Date() })
      .returning(['id', 'body', 'title', 'state', 'author_id', 'poll_two_id', 'poll_two_id'])
      .then((proposalData) => {
        const data = proposalData[0];

        return insertIntoFeed(
          {
            viewer: { id: 0, role: { type: 'system' } },
            data: { type: 'proposal', content: data, objectId: data.id },
            verb: 'update',
          },
          true,
        )
          .then((activityId) => {
            if (activityId) {
              pubsub.publish('activities', { id: activityId });
            }
          })
          .catch(err => log.error({ err }, 'Feed insertion failed -worker- '));
      });
  });

  return Promise.all(mutations);

  // workerFn();
}

const worker = async (pubsub) => {
  try {
    proposalPolling(pubsub);
  } catch (e) {
    console.error(e);
  }
  setTimeout(() => {
    worker(pubsub);
  }, 10000);
};

export default worker;
