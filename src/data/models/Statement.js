import Poll from './Poll';
import Vote from './Vote';
import knex from '../knex';
import User from './User';
import Activity from './Activity';

/* eslint-disable no-unused-vars */
function checkCanSee(viewer, data) {
  // TODO change data returned based on permissions
  return true;
}

function validateVoter(viewer, data) {}
function validateTitle(viewer, data) {}
function validateBody(viewer, data) {}

class Statement {
  constructor(data) {
    this.id = data.id;
    this.author_id = data.author_id;
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
  /* eslint-enable no-unused-vars */
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

  static async delete(viewer, data) {
    if (!Statement.canMutate(viewer, data)) return null;

    // validate
    if (!data.pollId) return null;
    if (!data.id) return null;
    // eslint-disable-next-line prefer-arrow-callback
    const deletedStatement = await knex.transaction(async function (trx) {
      const statementInDB = await knex('statements').where({ id: data.id }).select();
      if (statementInDB.length !== 1) throw Error('Statement does not exist!');
      await trx.where({ id: data.id }).into('statements').del();

      return statementInDB[0];
    });
    return new Statement(deletedStatement) || null;
  }

  static async update(viewer, data, loaders) {
    if (!Statement.canMutate(viewer, data)) return null;

    // validate
    if (!data.pollId) return null;
    if (!data.id) return null;
    if (data.text && data.text.length < 1 && data.text !== 'string') return null;
    // update
    // eslint-disable-next-line prefer-arrow-callback
    const updatedId = await knex.transaction(async function (trx) {
      const statementInDB = await knex('statements').where({ id: data.id }).pluck('id');
      if (statementInDB.length !== 1) throw Error('Statement does not exist!');
      if (statementInDB.deleted_at) throw Error('Statement cannot be changed');
      const newData = { updated_at: new Date(), body: data.text };
      await trx
        .where({ id: data.id })
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
    if (!data.text) return null;
    if (!data.text.length > 0 && typeof data.text === 'string') return null;

    // create
    // eslint-disable-next-line prefer-arrow-callback
    const newStatementId = await knex.transaction(async function (trx) {
      const vote = await Statement.validateVote(viewer, data.vote, loaders);
      if (!vote) throw Error('Vote not valid');
      const statementInDB = await knex('statements')
        .where({ poll_id: data.pollId, author_id: viewer.id })
        .pluck('id');
      if (statementInDB.length !== 0) throw Error('Already commented!');
      const id = await trx
        .insert(
        {
          author_id: viewer.id,
          poll_id: data.pollId,
          body: data.text,
          position: vote.position,
          vote_id: vote.id,
          created_at: new Date(),
        },
          'id',
        )
        .into('statements');

      if (id.length === 0) throw Error('No Id returned');
      return id[0];
    });
    if (!newStatementId) return null;
    return Statement.gen(viewer, newStatementId, loaders);
  }

  static async flag(viewer, data, loaders) {
    // authorize
    if (!Statement.canMutate(viewer, data)) return null;
    // validate
    if (!data) return null;
    if (!data.statementId || !data.content) return null;
    const content = data.content.trim();
    if (!content.length > 1) return null;
    const newFlaggedId = await knex.transaction(async (trx) => {
      // get statement
      const statementInDB = await Statement.gen(viewer, data.statementId, loaders);
      if (!statementInDB) return null;
      const author = await User.gen(viewer, statementInDB.author_id, loaders);
      if (!author) return null;
      // check if already flagged
      let id = null;
      const flagged = await trx
        .where({ flagged_id: author.id, statement_id: statementInDB.id })
        .pluck('id')
        .into('flagged_statements');
      id = flagged[0];
      if (id) {
        // update count;
        await knex('flagged_statements')
          .transacting('trx')
          .forUpdate()
          .where({ id })
          .increment('flag_count', 1);
      } else {
        id = await trx
          .insert({
            flagger_id: viewer.id,
            flagged_id: author.id,
            statement_id: statementInDB.id,
            content,
            flag_count: 1,
            created_at: new Date(),
          })
          .into('flagged_statements')
          .returning('id');

        id = id[0];
      }
      return id || null;
      // should throw automatically if flagger, flagged or statment does not exist
    });
    if (!newFlaggedId) return null;
    const res = await knex('flagged_statements').where({ id: newFlaggedId }).select();
    return res[0];
  }

  static async solveFlag(viewer, data, loaders) {
    // authorize
    if (!Statement.canMutate(viewer, data)) return null;

    // validate
    if (!data) return null;
    if (!data.id) return null;

    const id = await knex.transaction(async (trx) => {
      // update
      let flaggedStmt = await knex('flagged_statements')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.id })
        .select();
      flaggedStmt = flaggedStmt[0];
      if (!flaggedStmt || flaggedStmt.state !== 'open') return null;
      // check statement exists
      const statementInDB = await Statement.gen(viewer, flaggedStmt.statement_id, loaders);
      if (!statementInDB) {
        // already deleted by user
        return null;
      }

      if (data.action === 1) {
        // delete

        // check if flaggedStatements
        const text = `Deleted by moderation at ${new Date()}`;
        await knex('statements')
          .transacting(trx)
          .forUpdate()
          .where({ id: flaggedStmt.statement_id })
          .update({ body: text, deleted_at: new Date() });
        await knex('flagged_statements')
          .transacting(trx)
          .forUpdate()
          .where({ id: flaggedStmt.id })
          .update({ state: 'deleted', solver_id: viewer.id });
      } else {
        // reject
        await knex('flagged_statements')
          .transacting(trx)
          .forUpdate()
          .where({ id: flaggedStmt.id })
          .update({ state: 'rejected', solver_id: viewer.id });
      }
      loaders.statements.clear(flaggedStmt.statement_id);
      return flaggedStmt.id;
    });
    const res = await knex('flagged_statements').where({ id }).select();
    return res[0];
  }

  static async insertInFeed(viewer, statement, verb) {
    // create activity;
    const userId = 2;
    const activityId = await Activity.create(
      { id: viewer.id },
      { action: 'create', verb, type: 'statement', objectId: statement.id },
    );
    // add activity to feed
    // create activity;

    let aIds = await knex('system_feeds').where({ user_id: userId }).select('activity_ids');
    aIds = aIds[0].activity_ids || [];
    aIds.push(activityId[0]);
    await knex('system_feeds')
      .where({ user_id: userId })
      .update({ activity_ids: JSON.stringify(aIds), updated_at: new Date() });

    // TODO extract
    // insert also in own feed to for followers
    aIds = await knex('feeds').where({ user_id: viewer.id }).select('activity_ids');

    if (!aIds[0]) {
      await knex('feeds').insert({
        user_id: viewer.id,
        activity_ids: JSON.stringify(activityId),
        created_at: new Date(),
      });
    } else {
      aIds = aIds[0].activity_ids || [];
      aIds.push(activityId[0]);
      await knex('feeds')
        .where({ user_id: viewer.id })
        .update({ activity_ids: JSON.stringify(aIds), updated_at: new Date() });
    }
  }
}

export default Statement;
