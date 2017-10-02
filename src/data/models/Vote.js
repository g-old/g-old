import knex from '../knex';
import Poll from './Poll';
import Proposal from './Proposal';
import Statement from './Statement';
import { canSee, canMutate, Models } from '../../core/accessControl';

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
    if (!canSee(viewer, data, Models.VOTE)) return null;
    return new Vote(data);
  }

  static async validate(viewer, data, loaders, poll, trx, mutation = false) {
    if (!poll || !poll.isVotable()) return null;
    const proposal = await Proposal.genByPoll(viewer, poll.id, loaders);
    if (!proposal || !proposal.isVotable(viewer)) return null;
    const voteInDB = await knex('votes')
      .transacting(trx)
      .forUpdate()
      .where({ poll_id: data.pollId, user_id: viewer.id })
      .select();
    if (mutation && voteInDB.length === 0) return null;
    if (voteInDB.length !== 0) return mutation ? { ...voteInDB[0] } : null;
    return true;
  }

  static async delete(viewer, data, loaders) {
    if (!data.id) return null;
    if (!data.pollId) return null;
    if (!canMutate(viewer, data, Models.VOTE)) return null;
    const poll = await Poll.gen(viewer, data.pollId, loaders); // auth should happen here ...
    let deletedStatement;
    const deletedVote = await knex.transaction(async trx => {
      const oldVote = await Vote.validate(
        viewer,
        data,
        loaders,
        poll,
        trx,
        true,
      );
      if (!oldVote || !oldVote.position) throw Error('Request invalid!');
      // eslint-disable-next-line eqeqeq
      if (data.id != oldVote.id) throw Error('Request invalid!');
      const newPosition = data.position === 1 ? 'pro' : 'con'; // dangerous?
      if (newPosition !== oldVote.position) throw Error('Request invalid!');
      // eslint-disable-next-line newline-per-chained-call
      // check if statements exists, check if it can be deleted (cascading)

      let statementInDB = await knex('statements')
        .transacting(trx)
        .forUpdate()
        .where({ vote_id: data.id })
        .select();
      statementInDB = statementInDB[0] || {};
      if (statementInDB.id) {
        if (statementInDB.deleted_at) {
          throw Error('Cannot be modified!');
        }
        deletedStatement = new Statement(statementInDB);
        // statement gets deleted by cascading on delete
      }
      // eslint-disable-next-line newline-per-chained-call

      await knex('votes')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.id })
        .del();
      // update votecount
      const columns = ['upvotes', 'downvotes'];
      const index = newPosition === 'con' ? 1 : 0;
      await knex('polls')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.pollId })
        .decrement(columns[index], 1);
      return oldVote;
    });
    return { deletedVote: new Vote(deletedVote) || null, deletedStatement };
  }

  static async update(viewer, data, loaders) {
    // throw Error('TESTERROR');

    if (!data.id) return null;
    if (!data.pollId) return null;
    if (!canMutate(viewer, data, Models.VOTE)) return null;
    const poll = await Poll.gen(viewer, data.pollId, loaders); // auth should happen here ...

    if (await poll.isUnipolar(viewer, loaders)) {
      return null; // delete is the right method
    }
    let deletedStatement;
    await knex.transaction(async trx => {
      const oldVote = await Vote.validate(
        viewer,
        data,
        loaders,
        poll,
        trx,
        true,
      );
      if (!oldVote || !oldVote.position) throw Error('Position mismatch');
      // eslint-disable-next-line eqeqeq
      if (data.id != oldVote.id) throw Error('Id mismatch');

      let statementInDB = await knex('statements')
        .transacting(trx)
        .forUpdate()
        .where({ vote_id: data.id })
        .select();
      statementInDB = statementInDB[0] || {};
      if (statementInDB.id) {
        if (statementInDB.deleted_at) {
          throw Error('Cannot be modified!');
        }
        deletedStatement = new Statement(statementInDB);

        // eslint-disable-next-line newline-per-chained-call
        await knex('statements')
          .transacting(trx)
          .forUpdate()
          .where({ vote_id: data.id })
          .del();
      }

      const newPosition = data.position === 1 ? 'pro' : 'con'; // dangerous?
      if (newPosition === oldVote.position) throw Error('Request invalid');
      // eslint-disable-next-line newline-per-chained-call
      await knex('votes')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.id })
        .update({
          position: newPosition,
          updated_at: new Date(),
        });
      // update votecount
      const columns = ['upvotes', 'downvotes'];
      let index = newPosition === 'con' ? 1 : 0;

      await knex('polls')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.pollId })
        .increment(columns[index], 1);
      await knex('polls')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.pollId })
        .decrement(columns[(index = 1 - index)], 1);
    });

    return {
      updatedVote: await Vote.gen(viewer, data.id, loaders),
      deletedStatement,
    };
  }

  static async create(viewer, data, loaders) {
    // authenticate later?
    // throw Error('TESTERROR');
    // validate
    if (!data.pollId) return null;
    if (!canMutate(viewer, data, Models.VOTE)) return null;

    const poll = await Poll.gen(viewer, data.pollId, loaders); // auth should happen here ...
    if (!poll || !poll.isVotable()) return null;
    //
    const proposal = await Proposal.genByPoll(viewer, poll.id, loaders);
    if (!proposal || !proposal.isVotable(viewer)) return null;
    //

    let position = data.position === 1 ? 'pro' : 'con';

    if (await poll.isUnipolar(viewer, loaders)) {
      position = 'pro';
    }
    const newVoteId = await knex.transaction(async trx => {
      const voteInDB = await knex('votes') // TODO prob. superflue bc constraint
        .transacting(trx)
        .forUpdate()
        .where({ poll_id: data.pollId, user_id: viewer.id })
        .pluck('id');
      if (voteInDB.length !== 0) throw Error('Already voted!');
      const id = await knex('votes')
        .transacting(trx)
        .forUpdate()
        .insert(
          {
            user_id: viewer.id,
            poll_id: data.pollId,
            position,
            created_at: new Date(),
          },
          'id',
        );
      if (id.length === 0) throw Error('No Id returned');
      // update votecount;
      // TODO these updates are sequential - can db-ops be parallel in transactions?
      const columns = ['upvotes', 'downvotes'];
      const index = position === 'con' ? 1 : 0;
      await knex('polls')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.pollId })
        .increment(columns[index], 1);
      return id[0];
    });
    if (!newVoteId) return null;
    return Vote.gen(viewer, newVoteId, loaders);
  }
}

export default Vote;
