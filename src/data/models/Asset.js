import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

class Asset {
  constructor(data) {
    this.id = data.id;
    this.source = data.source;
    this.type = data.type;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.deletedAt = data.deleted_at;
    this.authorId = data.author_id;
    this.name = data.name;
  }

  static async gen(viewer, id) {
    const data = await knex('assets')
      .where({ id })
      .select();
    if (data === null) return null;
    return canSee(viewer, data, Models.ASSET) ? new Asset(data) : null;
  }

  static async create(viewer, data) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.ASSET)) return null;

    const newData = {
      created_at: new Date(),
    };
    const assetInDB = await knex.transaction(async trx => {
      const [asset = null] = await knex('assets')
        .transacting(trx)
        .insert(newData)
        .returning('*');

      return asset;
    });

    return assetInDB ? new Asset(assetInDB) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.ASSET)) return null;
    const newData = { updated_at: new Date() };
    const updatedAsset = await knex.transaction(async trx => {
      const [asset = null] = await knex('assets')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return asset;
    });

    return updatedAsset ? new Asset(updatedAsset) : null;
  }

  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.ASSET)) return null;
    const deletedAsset = await knex.transaction(async trx => {
      await knex('assets')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });

    return deletedAsset ? new Asset(deletedAsset) : null;
  }
}

export default Asset;
