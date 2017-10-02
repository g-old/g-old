import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

class StatementLike {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.statementId = data.statement_id;
  }
  static async gen(viewer, id, { statementLikes }) {
    const data = await statementLikes.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.S_LIKE) ? new StatementLike(data) : null;
  }

  static async delete(viewer, data) {
    if (!data.id || !viewer) return null;
    if (!canMutate(viewer, data, Models.S_LIKE)) return null;
    // eslint-disable-next-line prefer-arrow-callback
    const deletedLike = await knex.transaction(async function(trx) {
      let likeInDB = await knex('statement_likes')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.id, user_id: viewer.id })
        .select();
      likeInDB = likeInDB[0];
      if (!likeInDB) throw Error('Nothing to delete!');
      // eslint-disable-next-line eqeqeq
      if (likeInDB.user_id != viewer.id) throw Error('Permission denied');
      await knex('statement_likes')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.id, user_id: viewer.id })
        .del();
      // update votecount;
      await knex('statements')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.statementId })
        .decrement('likes', 1);
      return likeInDB;
    });

    return deletedLike ? new StatementLike(deletedLike) : null;
  }

  static async create(viewer, data, loaders) {
    // validate
    if (!data.statementId || !viewer) return null;
    if (!canMutate(viewer, data, Models.S_LIKE)) return null;

    // create
    // eslint-disable-next-line prefer-arrow-callback
    const newLikeId = await knex.transaction(async function(trx) {
      const likeInDB = await knex('statement_likes')
        .transacting(trx)
        .forUpdate()
        .where({ statement_id: data.statementId, user_id: viewer.id })
        .pluck('id')
        .into('statement_likes');
      if (likeInDB.length !== 0) throw Error('Already liked!');
      const id = await knex('statement_likes')
        .transacting(trx)
        .forUpdate()
        .insert(
          {
            user_id: viewer.id,
            statement_id: data.statementId,
            created_at: new Date(),
          },
          'id',
        );

      if (id.length === 0) throw Error('No Id returned');

      // update votecount;
      // TODO these updates are sequential - can db-ops be parallel in transactions?
      await knex('statements')
        .transacting(trx)
        .forUpdate()
        .where({ id: data.statementId })
        .increment('likes', 1)
        .into('statements');
      return id[0];
    });
    if (!newLikeId) return null;

    return StatementLike.gen(viewer, newLikeId, loaders);
  }
}

export default StatementLike;
