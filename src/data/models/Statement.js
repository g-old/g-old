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
    this.deletedAt = data.deleted_at;
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
  static async validateVote(viewer, id, loaders) {
    const voteInDb = await Vote.gen(viewer, id, loaders);
    if (!voteInDb || voteInDb.userId !== viewer.id) return null;
    return voteInDb;
  }

  static async delete(viewer, data, loaders) {
    if (!Statement.canMutate(viewer, data)) return null;

    // validate
    if (!data.id) return null;
    // eslint-disable-next-line prefer-arrow-callback
    const deletedStatement = await knex.transaction(async function (trx) {
      const statementInDB = await Statement.gen(viewer, data.id, loaders);
      if (!statementInDB) throw Error('Statement does not exist!');
      if (statementInDB.deletedAt) throw Error('Statement cannot be modified!');
      await trx.where({ id: data.id }).into('statements').del();

      return statementInDB;
    });
    return deletedStatement || null;
  }

  static async update(viewer, data, loaders) {
    if (!Statement.canMutate(viewer, data)) return null;

    // validate
    if (!data.id) return null;
    if (data.text && data.text.length < 1 && data.text !== 'string') return null;
    // update
    // eslint-disable-next-line prefer-arrow-callback
    const updatedId = await knex.transaction(async function (trx) {
      const statementInDB = await Statement.gen(viewer, data.id, loaders);
      if (!statementInDB) throw Error('Statement does not exist!');
      if (statementInDB.deletedAt) throw Error('Statement cannot be changed');
      const newData = { updated_at: new Date(), body: data.text };
      await trx
        .where({ id: data.id })
        .update({
          ...newData,
        })
        .into('statements');
      loaders.statements.clear(data.id);
      return data.id;
    });
    if (!updatedId) return null;
    return Statement.gen(viewer, updatedId, loaders);
  }

  static async create(viewer, data, loaders) {
    // authorize
    if (!Statement.canMutate(viewer, data)) return null;
    // validate

    if (!data.pollId || !data.voteId) return null;
    const poll = await Poll.gen(viewer, data.pollId, loaders);
    if (!poll) return null;
    const statementsAllowed = await poll.isCommentable(viewer, loaders);
    if (!statementsAllowed) return null;
    if (!data.text) return null;
    if (!data.text.length > 0 && typeof data.text === 'string') return null;

    // create
    // eslint-disable-next-line prefer-arrow-callback
    const newStatementId = await knex.transaction(async function (trx) {
      const vote = await Statement.validateVote(viewer, data.voteId, loaders);
      if (!vote.id) throw Error('Vote not valid');
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
      let flaggedStmtInDB = await trx
        .where({ flagged_id: author.id, statement_id: statementInDB.id })
        .select()
        .into('flagged_statements');
      flaggedStmtInDB = flaggedStmtInDB[0] || [];
      if (flaggedStmtInDB.state && flaggedStmtInDB.state !== 'open') return null; // throw Error('Already solved!');
      if (flaggedStmtInDB.id) {
        // update count;
        await knex('flagged_statements')
          .transacting('trx')
          .forUpdate()
          .where({ id: flaggedStmtInDB.id })
          .increment('flag_count', 1);
      } else {
        flaggedStmtInDB = await trx
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

        flaggedStmtInDB = { id: flaggedStmtInDB[0] };
      }
      return flaggedStmtInDB.id || null;
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
    //  if (!data.id) return null;

    const id = await knex.transaction(async (trx) => {
      // update
      let flaggedStmtInDb = data.id
        ? await knex('flagged_statements')
            .transacting(trx)
            .forUpdate()
            .where({ id: data.id })
            .select()
        : await knex('flagged_statements')
            .transacting(trx)
            .forUpdate()
            .where({ statement_id: data.statementId })
            .select();
      flaggedStmtInDb = flaggedStmtInDb[0] || [];
      if (flaggedStmtInDb.state && flaggedStmtInDb.state !== 'open') throw Error('Already solved!');
      // check statement exists
      const statementInDB = await Statement.gen(
        viewer,
        flaggedStmtInDb.statement_id || data.statementId,
        loaders,
      );
      if (!statementInDB) {
        // already deleted by user
        return null;
      }
      //-----
      const text = `Deleted by moderation at ${new Date()}`;
      if (data.statementId && !flaggedStmtInDb.id) {
        // create fstatement
        let flaggedStmtId = await knex('flagged_statements')
          .transacting(trx)
          .forUpdate()
          .insert({
            flagger_id: viewer.id,
            flagged_id: statementInDB.author_id,
            statement_id: statementInDB.id,
            content: statementInDB.text,
            state: 'deleted',
            solver_id: viewer.id,
            flag_count: 0,
            created_at: new Date(),
          })
          .returning('id');
        flaggedStmtId = flaggedStmtId[0];
        await knex('statements')
          .transacting(trx)
          .forUpdate()
          .where({ id: statementInDB.id })
          .update({ body: text, deleted_at: new Date() });
        loaders.statements.clear(flaggedStmtId);

        return flaggedStmtId;
      }

      //------
      if (data.action === 'delete') {
        // delete

        // check if flaggedStatements
        await knex('statements')
          .transacting(trx)
          .forUpdate()
          .where({ id: flaggedStmtInDb.statement_id })
          .update({ body: text, deleted_at: new Date() });
        await knex('flagged_statements')
          .transacting(trx)
          .forUpdate()
          .where({ id: flaggedStmtInDb.id })
          .update({ state: 'deleted', solver_id: viewer.id });
      } else {
        // reject
        await knex('flagged_statements')
          .transacting(trx)
          .forUpdate()
          .where({ id: flaggedStmtInDb.id })
          .update({ state: 'rejected', solver_id: viewer.id });
      }
      loaders.statements.clear(flaggedStmtInDb.statement_id);
      return flaggedStmtInDb.id;
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
