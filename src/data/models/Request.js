import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';

class Request {
  constructor(data) {
    this.id = data.id;
    this.requesterId = data.requester_id;
    this.processorId = data.processor_id;
    this.type = data.type;
    this.content = data.content;
    this.deniedAt = data.denied_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async gen(viewer, id) {
    const [data = null] = await knex('requests')
      .where({ id })
      .select('*');
    if (data === null) return null;
    return canSee(viewer, data, Models.REQUEST) ? new Request(data) : null;
  }

  static async create(viewer, data) {
    if (!data || !data.content) return null;
    if (!canMutate(viewer, data, Models.REQUEST)) return null;
    if (data.content.length > 300) return null;
    const parsed = JSON.parse(data.content);
    const content = { id: parsed.id };
    if (!content.id) return null;
    const newData = {
      requester_id: viewer.id,
      type: data.type,
      content,
      created_at: new Date(),
    };
    if (data.type !== 'joinWT') {
      throw Error('Selectors and validators for other types to implement');
    }
    const requestInDB = await knex.transaction(async trx => {
      const res = await knex('requests')
        .where({ requester_id: viewer.id, type: data.type })
        .whereRaw("content->>'id' = ?", [content.id])
        .pluck('id');
      if (res[0]) {
        throw new Error('Already requested!');
      }
      const [request = null] = await knex('requests')
        .transacting(trx)
        .forUpdate()
        .insert(newData)
        .returning('*');

      return request;
    });

    return requestInDB ? new Request(requestInDB) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.REQUEST)) return null;

    const newData = {
      processor_id: viewer.id,
      denied_at: data.deny ? new Date() : null,
      updated_at: new Date(),
    };
    const updatedRequest = await knex.transaction(async trx => {
      const [request = null] = await knex('requests')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return request;
    });

    return updatedRequest ? new Request(updatedRequest) : null;
  }

  static async delete(viewer, data, loaders) {
    if (!data || (!data.id && !data.type)) return null;

    if (!canMutate(viewer, data, Models.REQUEST)) return null;

    const deletedRequest = await knex.transaction(async trx => {
      let request;
      if (data.type) {
        if (data.type === 'joinWT') {
          const [requestData = null] = await knex('requests')
            .where({ requester_id: viewer.id, type: data.type })
            .select('*');
          request = requestData ? new Request(requestData) : null;
        } else {
          throw new Error('Type not recognized');
        }
      } else {
        request = await Request.gen(viewer, data.id, loaders);
      }

      await knex('requests')
        .where({ id: request.id })
        .transacting(trx)
        .forUpdate()
        .del();

      return request;
    });

    return deletedRequest ? new Request(deletedRequest) : null;
  }
}

export default Request;
