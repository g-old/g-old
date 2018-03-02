import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';
import { validateEmail } from '../../core/helpers';

const checkEmail = async email => {
  if (validateEmail(email)) {
    const [emailExists] = await knex('users')
      .where({ email })
      .pluck('id');
    return emailExists ? false : email.trim();
  }
  return false;
};

const getAndValidateContent = async (type, content, request) => {
  const parsed = JSON.parse(content);
  switch (type) {
    case 'joinWT': {
      return { id: parsed.id };
    }
    case 'changeEmail': {
      const validEmail = await checkEmail(parsed.email);
      if (!validEmail) {
        throw new Error('request-email-exists');
      }

      await 'knex';
      return {
        id: parsed.id,
        email: validEmail,
        host: request.hostname,
        connection: __DEV__ ? 'http' : 'https',
        lang: request.cookies.lang,
      };
    }

    default:
      throw new Error(`request-type-invalid: ${type}`);
  }
};
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

  static async create(viewer, data, loaders, req) {
    if (!data || !data.content) return { errors: ['request-data-missing'] };
    if (!canMutate(viewer, data, Models.REQUEST))
      return { errors: ['request-authorization-failing'] };
    if (data.content.length > 300) return { errors: ['request-content-size'] };
    let content;
    try {
      content = await getAndValidateContent(data.type, data.content, req);
    } catch (e) {
      return { errors: [e.message] };
    }
    if (!content.id) return { errors: ['request-content-id'] };
    const newData = {
      requester_id: viewer.id,
      type: data.type,
      content,
      created_at: new Date(),
    };
    if (!(data.type === 'joinWT' || data.type === 'changeEmail')) {
      return { errors: ['request-type-invalid'] };
    }
    const requestInDB = await knex.transaction(async trx => {
      const res = await knex('requests')
        .where({ requester_id: viewer.id, type: data.type })
        .whereRaw("content->>'id' = ?", [content.id])
        .where({ type: data.type })
        .pluck('id');
      if (res[0]) {
        return { errors: ['request-existance-true'] };
      }
      const [request = null] = await knex('requests')
        .transacting(trx)
        .forUpdate()
        .insert(newData)
        .returning('*');

      return request;
    });
    if (!requestInDB) return { errors: ['request-save-failure'] };
    const request = new Request(requestInDB);
    if (request.type === 'changeEmail') {
      EventManager.publish('sendVerificationMail', { viewer, request });
    }

    return { result: request };
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
        if (data.type === 'joinWT' || data.type === 'changeEmail') {
          throw new Error('To implement: Finding of request to delete');
          /* const [requestData = null] = await knex('requests')
            .where({ requester_id: viewer.id, type: data.type })
            .select('*');
          request = requestData ? new Request(requestData) : null; */
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

    return deletedRequest || null;
  }
}

export default Request;
