import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import WorkTeam from './WorkTeam';

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

    const newData = {
      requester_id: viewer.id,
      type: data.type,
      content: JSON.stringify(data.content),
      created_at: new Date(),
    };
    const requestInDB = await knex.transaction(async trx => {
      const [request = null] = await knex('requests')
        .transacting(trx)
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
      denied_at: new Date(),
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
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.REQUEST)) return null;
    const deletedRequest = await knex.transaction(async trx => {
      const request = await Request.gen(viewer, data.id, loaders);

      if (request.type === 'joinWT') {
        const wt = JSON.parse(request.content);
        if (!wt.id) {
          throw new Error('No team given');
        }
        const workTeam = await WorkTeam.gen(viewer, wt.id, loaders);
        const res = await workTeam.join(viewer, request.requester_id, loaders);
        if (!res) {
          throw new Error('Joining Workteam failed');
        }
      } else {
        throw new Error('Type not recognized');
      }
      await knex('requests')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();

      return request;
    });

    return deletedRequest ? new Request(deletedRequest) : null;
  }
}

export default Request;
