import Poll from './Poll';
import Vote from './Vote';
import knex from '../knex';
import User from './User';
import Proposal from './Proposal';

import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';

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

  static async gen(viewer, id, loaders) {
    const data = await loaders.statements.load(id);
    if (data === null) return null;
    const proposal = await Proposal.genByPoll(viewer, data.poll_id, loaders);
    data.proposal = proposal;
    return canSee(viewer, data, Models.STATEMENT) ? new Statement(data) : null;
  }

  /* eslint-enable no-unused-vars */
  static async validateVote(viewer, id, loaders) {
    const voteInDb = await Vote.gen(viewer, id, loaders);
    if (!voteInDb || voteInDb.userId !== viewer.id) return null;
    return voteInDb;
  }

  static async delete(viewer, data, loaders) {
    /* const e = Math.random();
    if (e > 0.5) {
      console.log('ERROR');
      throw new Error('TESTERROR');
    } */
    if (!data || !data.id || !data.pollId) return null;
    const proposal = await Proposal.genByPoll(viewer, data.pollId, loaders);

    if (!canMutate(viewer, { data, proposal }, Models.STATEMENT)) return null;
    // validate
    // eslint-disable-next-line prefer-arrow-callback
    const deletedStatement = await knex.transaction(async function(trx) {
      const statementInDB = await Statement.gen(viewer, data.id, loaders);
      if (!statementInDB) throw Error('Statement does not exist!');
      // eslint-disable-next-line eqeqeq
      if (statementInDB.author_id != viewer.id)
        throw Error('Permission denied');
      if (statementInDB.deletedAt) throw Error('Statement cannot be modified!');
      await trx
        .where({ id: data.id })
        .into('statements')
        .del();

      return statementInDB;
    });

    if (deletedStatement) {
      EventManager.publish('onStatementDeleted', {
        viewer,
        statement: deletedStatement,
        ...(proposal.workTeamId && {
          groupId: proposal.workTeamId,
          info: { workTeamId: proposal.workTeamId },
        }),
      });
    }
    return deletedStatement || null;
  }

  static async update(viewer, data, loaders) {
    /* const e = Math.random();
    if (e > 0.5) {
      console.log('ERROR');
      throw new Error('TESTERROR');
    } */
    // validate
    if (!data.id) return null;
    if (data.text && data.text.length < 1 && data.text.length) {
      return null;
    }
    const statementInDB = await Statement.gen(viewer, data.id, loaders);
    if (!statementInDB) throw Error('Statement does not exist!');
    const proposal = await Proposal.genByPoll(
      viewer,
      statementInDB.pollId,
      loaders,
    );

    if (!canMutate(viewer, { ...data, proposal }, Models.STATEMENT))
      return null;

    // update
    // eslint-disable-next-line prefer-arrow-callback
    const updatedId = await knex.transaction(async function(trx) {
      // eslint-disable-next-line eqeqeq
      if (statementInDB.author_id != viewer.id)
        throw Error('Permission denied!');
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
    const statement = await Statement.gen(viewer, updatedId, loaders);
    if (statement) {
      EventManager.publish('onStatementUpdated', {
        viewer,
        statement,
        ...(proposal.workTeamId && {
          groupId: proposal.workTeamId,
          info: { workTeamId: proposal.workTeamId },
        }),
      });
    }
    return statement;
  }

  static async create(viewer, data, loaders) {
    /* const e = Math.random();
    if (e > 0.5) {
      console.log('ERROR');
      throw new Error('TESTERROR');
    } */
    // authorize
    if (!data.pollId || !data.voteId) return null;
    const proposal = await Proposal.genByPoll(viewer, data.pollId, loaders);

    if (!canMutate(viewer, { ...data, proposal }, Models.STATEMENT))
      return null;
    // validate

    const poll = await Poll.gen(viewer, data.pollId, loaders);
    if (!poll) return null;
    const statementsAllowed = await poll.isCommentable(viewer, loaders);
    if (!statementsAllowed) return null;
    if (!data.text) return null;
    if (!data.text.length > 0 && typeof data.text === 'string') return null;

    // create
    // eslint-disable-next-line prefer-arrow-callback
    const newStatementId = await knex.transaction(async function(trx) {
      const vote = await Statement.validateVote(viewer, data.voteId, loaders);
      if (!vote.id) throw Error('Vote not valid');
      // TODO check if unique is applied on table statements
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
    const statement = await Statement.gen(viewer, newStatementId, loaders);
    if (statement) {
      EventManager.publish('onStatementCreated', {
        viewer,
        statement,
        subjectId: proposal.id,
        ...(proposal.workTeamId && {
          groupId: proposal.workTeamId,
          info: { workTeamId: proposal.workTeamId },
        }),
      });
    }
    return statement;
  }

  static async flag(viewer, data, loaders) {
    // authorize
    if (!canMutate(viewer, data, Models.FLAG)) return null;
    // validate
    if (!data) return null;
    if (!data.statementId || !data.content) return null;
    const content = data.content.trim();
    if (!content.length > 1) return null;
    const newFlaggedId = await knex.transaction(async trx => {
      // get statement
      const statementInDB = await Statement.gen(
        viewer,
        data.statementId,
        loaders,
      );
      if (!statementInDB) return null;
      const author = await User.gen(viewer, statementInDB.author_id, loaders);
      if (!author) return null;
      // check if already flagged
      let flaggedStmtInDB = await trx
        .where({ flagged_id: author.id, statement_id: statementInDB.id })
        .select()
        .into('flagged_statements');
      flaggedStmtInDB = flaggedStmtInDB[0] || [];
      if (flaggedStmtInDB.state && flaggedStmtInDB.state !== 'open')
        return null; // throw Error('Already solved!');
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
    const res = await knex('flagged_statements')
      .where({ id: newFlaggedId })
      .select();
    return res[0];
  }

  static async solveFlag(viewer, data, loaders) {
    // authorize
    if (!canMutate(viewer, data, Models.FLAG)) return null;

    // validate
    if (!data) return null;
    //  if (!data.id) return null;

    const id = await knex.transaction(async trx => {
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
      if (flaggedStmtInDb.state && flaggedStmtInDb.state !== 'open')
        throw Error('Already solved!');
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
        const [flaggedStmtId = null] = await knex('flagged_statements')
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
    const res = await knex('flagged_statements')
      .where({ id })
      .select();
    return res[0];
  }
}

export default Statement;
