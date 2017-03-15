
import Poll from './Poll';
import Vote from './Vote';
import knex from '../knex';

/* eslint-disable no-unused-vars */
function checkCanSee(viewer, data) { // TODO change data returned based on permissions
  return true;
}

function validateVoter(viewer, data) {
}
function validateTitle(viewer, data) {
}
function validateBody(viewer, data) {
}

class Statement {
  constructor(data) {
    this.id = data.id;
    this.author_id = data.author_id;
    this.title = data.title;
    this.text = data.body;
    this.position = data.position;
    this.likes = data.likes;
    this.voteId = data.vote_id;
    this.pollId = data.poll_id;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async gen(viewer, id, { statements }) {
    const data = await statements.load(id);
    if (data === null) return null;
    const canSee = checkCanSee(viewer, data);
    return canSee ? new Statement(data) : null;
  }

  static canMutate(viewer, data) {
    return true;
  }

  static async validateVote(viewer, vote, loaders) {
    if (!vote) return null;
    let voteInDb;
    if (vote.id) {
      voteInDb = await Vote.gen(viewer, vote.id, loaders);
    } else {
      voteInDb = await Vote.create(viewer, vote, loaders);
    }
    return voteInDb || null;
  }

  static async delete(viewer, data, loaders) {
    if (!Statement.canMutate(viewer, data)) return null;

    // validate
    if (!data.pollId) return null;
    if (!data.id) return null;
    // eslint-disable-next-line prefer-arrow-callback
    const deletedStatement = await knex.transaction(async function (trx) {
      const statementInDB = await knex('statements').where({ id: data.id }).select();
      if (statementInDB.length !== 1) throw Error('Statement does not exist!');
      await trx.where({ id: data.id })
      .into('statements')
      .del();

      return statementInDB[0];
    });
    return new Statement(deletedStatement) || null;
  }

  static async update(viewer, data, loaders) {
    if (!Statement.canMutate(viewer, data)) return null;

    // validate
    if (!data.pollId) return null;
    if (!data.id) return null;

    if (data.title && data.title.length < 1 && (data.title) !== 'string') return null;
    if (data.text && data.text.length < 1 && (data.text) !== 'string') return null;
    if (!data.title && !data.text) return null;
    // update
    // eslint-disable-next-line prefer-arrow-callback
    const updatedId = await knex.transaction(async function (trx) {
      const statementInDB = await knex('statements').where({ id: data.id }).pluck('id');
      if (statementInDB.length !== 1) throw Error('Statement does not exist!');
      const newData = { updated_at: new Date(), title: data.title, body: data.text };
      const id = await trx.where({ id: data.id })
      .update({
        ...newData,
      })
        .into('statements');

      return data.id;
    });
    if (!updatedId) return null;
    return Statement.gen(viewer, updatedId, loaders);
  }

  static async create(viewer, data, loaders) {
    // authorize
    if (!Statement.canMutate(viewer, data)) return null;
    // validate

    if (!data.pollId) return null;
    const poll = await Poll.gen(viewer, data.pollId, loaders);
    if (!poll) return null;
    const statementsAllowed = await poll.isCommentable(viewer, loaders);
    if (!statementsAllowed) return null;
    if (!data.title) return null;
    if (!data.title.length > 0 && typeof (data.title) === 'string') return null;
    if (!data.text) return null;
    if (!data.text.length > 0 && typeof (data.text) === 'string') return null;

    // create
    // eslint-disable-next-line prefer-arrow-callback
    const newStatementId = await knex.transaction(async function (trx) {
      const vote = await Statement.validateVote(viewer, data.vote, loaders);
      if (!vote) throw Error('Vote not valid');
      const statementInDB = await knex('statements').where({ poll_id: data.pollId, author_id: viewer.id }).pluck('id');
      if (statementInDB.length !== 0) throw Error('Already commented!');
      const id = await trx
      .insert({
        author_id: viewer.id,
        poll_id: data.pollId,
        title: data.title,
        body: data.text,
        position: vote.position,
        vote_id: vote.id,
        created_at: new Date() }, 'id')
        .into('statements');

      if (id.length === 0) throw Error('No Id returned');
      return id[0];
    });
    if (!newStatementId) return null;
    return Statement.gen(viewer, newStatementId, loaders);
  }

}

export default Statement;
