import knex from '../knex';
import Poll from './Poll';
// eslint-disable-next-line no-unused-vars
function checkCanSee(viewer, data) { // TODO change data returned based on permissions
  return true;
}


class Vote {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.position = data.position;
    this.pollId = data.poll_id;
  }
  static async gen(viewer, id, { votes }) {
    if (!id) return null;
    const data = await votes.load(id);
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new Vote(data) : null;
  }

  static async validate(viewer, data, loaders, poll, mutation = false) {
    if (!poll || !poll.isVotable()) return null;
    const voteInDB = await knex('votes').where({ poll_id: data.pollId, user_id: viewer.id }).select();
    if (mutation && voteInDB.length === 0) return null;
    if (voteInDB.length !== 0) return mutation ? { ...voteInDB[0] } : null;
    return true;
  }

  static async delete(viewer, data, loaders) {
    if (!data.id) return null;
    if (!data.pollId) return null;
    const poll = await Poll.gen(viewer, data.pollId, loaders); // auth should happen here ...
    const oldVote = await Vote.validate(viewer, data, loaders, poll, true);

    if (!oldVote || !oldVote.position) return null;
    // eslint-disable-next-line eqeqeq
    if (data.id != oldVote.id) return null;
    const newPosition = data.position === 1 ? 'pro' : 'con'; // dangerous?
    if (newPosition !== oldVote.position) return null;

    // eslint-disable-next-line prefer-arrow-callback
    await knex.transaction(async function (trx) {
      await trx.where({ id: data.id })
          .into('votes')
          .del();

        // update votecount
      const columns = ['upvotes', 'downvotes'];
      const index = newPosition === 'con' ? 1 : 0;
      await trx.where({ id: data.pollId }).decrement(columns[index], 1).into('polls');
      await trx.where({ id: data.pollId }).decrement('num_voter', 1).into('polls');
    });
    return new Vote(oldVote) || null;
  }

  static async update(viewer, data, loaders) {
    if (!data.id) return null;
    if (!data.pollId) return null;
    const poll = await Poll.gen(viewer, data.pollId, loaders); // auth should happen here ...
    const oldVote = await Vote.validate(viewer, data, loaders, poll, true);
    if (!oldVote || !oldVote.position) return null;
    // eslint-disable-next-line eqeqeq
    if (data.id != oldVote.id) return null;
    if (await poll.isUnipolar(viewer, loaders)) {
      return null; // delete is the right method
    }
    const newPosition = data.position === 1 ? 'pro' : 'con'; // dangerous?
    if (newPosition === oldVote.position) return null;

    // update
    // eslint-disable-next-line prefer-arrow-callback
    await knex.transaction(async function (trx) {
      await trx.where({ id: data.id })
      .update({
        position: newPosition,
        updated_at: new Date() })
        .into('votes');

        // update votecount
      const columns = ['upvotes', 'downvotes'];
      let index = newPosition === 'con' ? 1 : 0;
      await trx.where({ id: data.pollId }).increment(columns[index], 1).into('polls');
      await trx.where({ id: data.pollId }).decrement(columns[index = 1 - index], 1).into('polls');
    });

    return Vote.gen(viewer, data.id, loaders);
  }

  static async create(viewer, data, loaders) {
    // authenticate later?

    // validate
    if (!data.pollId) return null;
    const poll = await Poll.gen(viewer, data.pollId, loaders); // auth should happen here ...
    if (!poll || !poll.isVotable()) return null;

    let position = data.position === 1 ? 'pro' : 'con';

    if (await poll.isUnipolar(viewer, loaders)) {
      position = 'pro';
    }

    // create
    // eslint-disable-next-line prefer-arrow-callback
    const newVoteId = await knex.transaction(async function (trx) {
      const voteInDB = await knex('votes').where({ poll_id: data.pollId, user_id: viewer.id }).pluck('id');
      // To avoid multiple votings, we have to place the check in the transaction
      // and lock the table if not locked  (how?)
      if (voteInDB.length !== 0) throw Error('Already voted!');
      const id = await trx
      .insert({
        user_id: viewer.id,
        poll_id: data.pollId,
        position,
        created_at: new Date() }, 'id')
        .into('votes');

      if (id.length === 0) throw Error('No Id returned');

        // update votecount;
        // TODO these updates are sequential - can db-ops be parallel in transactions?
      const columns = ['upvotes', 'downvotes'];
      const index = position === 'con' ? 1 : 0;
      await trx.where({ id: data.pollId }).increment(columns[index], 1).into('polls');
      await trx.where({ id: data.pollId }).increment('num_voter', 1).into('polls');
      return id[0];
    });

    if (!newVoteId) return null;
    return Vote.gen(viewer, newVoteId, loaders);
  }

}

export default Vote;
