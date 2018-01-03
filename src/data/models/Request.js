import knex from '../knex';
import { canMutate, Models } from '../../core/accessControl';

// TODO generate again

class Request {
  static async gen(viewer, id, { request }) {
    return request;
  }

  static async create(viewer, data) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.REQUEST)) return null;

    const requestInDB = await knex.transaction(async trx => {
      const [request] = await knex('request')
        .transacting(trx)
        .insert({
          created_at: new Date(),
        })
        .returning('*');

      return request;
    });

    return requestInDB ? new Request(requestInDB) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.REQUEST)) return null;
    const newData = { updated_at: new Date() };
    const updatedRequest = await knex.transaction(async trx => {
      const [request] = await knex('request')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return request;
    });

    return updatedRequest ? new Request(updatedRequest) : null;
  }

  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.REQUEST)) return null;
    const deletedRequest = await knex.transaction(async trx => {
      await knex('request')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });

    return deletedRequest ? new Request(deletedRequest) : null;
  }
}

export default Request;
