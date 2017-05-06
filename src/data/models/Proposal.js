import knex from '../knex';
import Poll from './Poll';
import Activity from './Activity';

// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}

class Proposal {
  constructor(data) {
    this.id = data.id;
    this.author_id = data.author_id;
    this.title = data.title;
    this.body = data.body;
    this.votes = data.votes;
    this.pollOne_id = data.poll_one_id;
    this.pollTwo_id = data.poll_two_id;
    this.state = data.state;
    this.createdAt = data.created_at;
  }
  static async gen(viewer, id, { proposals }) {
    const data = await proposals.load(id);
    if (data == null) return null;
    if (viewer == null) return null;
    return new Proposal(data);
    // return canSee ? new Proposal(data) : new Proposal(data.email = null);
  }

  // eslint-disable-next-line no-unused-vars
  static canMutate(viewer, data) {
    return ['admin', 'mod'].includes(viewer.role.type);
  }

  static async followees(id, { followees }) {
    const data = await followees.load(id);
    return data;
    /*  return Promise.resolve(knex('user_follows')
    .where({ follower_id: id }).pluck('followee_id')
    .then(ids => {return ids; }));
      */
  }
  static async update(viewer, data, loaders) {
    // authorize
    if (!Proposal.canMutate(viewer, data)) return null;
    // validate
    if (!data.id) return null;
    if (!data.title && !data.text) return null;
    const proposalInDb = await Proposal.gen(viewer, data.id, loaders);
    if (!proposalInDb) return null;
    if (proposalInDb.title === data.title && proposalInDb.body === data.text) return null;

    // update
    await knex.transaction(async (trx) => {
      await trx
        .where({
          id: data.id,
        })
        .update({
          // Not sure if await needed
          body: data.text,
          title: data.title,
          updated_at: new Date(),
        })
        .into('proposals');
    });
    return Proposal.gen(viewer, data.id, loaders) || null;
  }

  static async create(viewer, data, loaders) {
    // authorize
    if (!Proposal.canMutate(viewer, data)) return null;
    // validate
    if (!data.text) return null;
    if (!data.title) return null;
    if (!data.pollingModeId) return null;
    // create

    const newProposalId = await knex.transaction(async (trx) => {
      // ONLY testing!
      const date = new Date();
      const endDate = new Date();
      endDate.setDate(date.getDate() + 5);
      const pollOneData = {
        polling_mode_id: data.pollingModeId,
        secret: false,
        threshold: 20,
        start_time: new Date(),
        end_time: endDate,
      };
      const pollOne = await Poll.create(viewer, pollOneData, loaders);
      if (!pollOne) throw Error('No pollOne provided');

      const id = await trx
        .insert(
        {
          author_id: viewer.id,
          title: data.title,
          body: data.text,
          poll_one_id: pollOne.id,
          state: 'proposed',
          created_at: new Date(),
        },
          'id',
        )
        .into('proposals');
      return id[0];
    });
    if (!newProposalId) return null;
    return Proposal.gen(viewer, newProposalId, loaders);
  }

  static async insertInFeed(viewer, proposal, verb) {
    // create activity;
    const userId = 1;
    const activityId = await Activity.create(
      { id: viewer.id },
      { action: 'create', verb, type: 'proposal', objectId: proposal.id },
    );
    // add activity to feed
    // create activity;

    let aIds = await knex('system_feeds').where({ user_id: userId }).select('activity_ids');
    aIds = aIds[0].activity_ids;
    aIds.push(activityId[0]);
    await knex('system_feeds')
      .where({ user_id: userId })
      .update({ activity_ids: JSON.stringify(aIds), updated_at: new Date() });
  }
}

export default Proposal;
