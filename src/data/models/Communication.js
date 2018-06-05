import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import sanitize from '../../core/htmlSanitizer';

class Communication {
  constructor(data) {
    this.id = data.id;
    this.parentId = data.parent_id;
    this.textHtml = data.text_html;
    this.textRaw = data.text_raw;
    this.replyable = data.replyable;
    this.createdAt = data.created_at;
  }

  static async gen(viewer, id, { communications }) {
    const data = await communications.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.COMMUNICATION)
      ? new Communication(data)
      : null;
  }

  static async create(viewer, data) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.COMMUNICATION)) return null;

    const newData = {
      created_at: new Date(),
    };

    if (data.parentId) {
      newData.parent_id = data.parentId;
    }
    if (data.textRaw) {
      newData.text_raw = data.textRaw;
    }
    if (data.textHtml && data.textHtml.length < 10000) {
      newData.text_html = sanitize(data.textHtml);
    }
    if (data.replyable) {
      newData.replyable = data.replyable;
    }

    const [communication = null] = await knex('communications')
      .insert(newData)
      .returning('*');

    return communication ? new Communication(communication) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.COMMUNICATION)) return null;
    const newData = { updated_at: new Date() };
    const updatedCommunication = await knex.transaction(async trx => {
      const [communication = null] = await knex('communications')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return communication;
    });

    return updatedCommunication
      ? new Communication(updatedCommunication)
      : null;
  }

  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.COMMUNICATION)) return null;
    const deletedCommunication = await knex.transaction(async trx => {
      await knex('communications')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });

    return deletedCommunication
      ? new Communication(deletedCommunication)
      : null;
  }
}

export default Communication;
