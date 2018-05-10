import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
// import EventManager from '../../core/EventManager';

class Message {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.date = data.date;
    this.location = data.location;
    this.msg = data.msg;
    this.title = data.title;
    this.senderId = data.sender_id;
    this.createdAt = data.created_at;
  }

  static async gen(viewer, id) {
    const [data = null] = await knex('messages')
      .where({ id })
      .select();
    if (!data) return null;
    return canSee(viewer, data, Models.MESSAGE) ? new Message(data) : null;
  }

  static async create(viewer, data, loaders, trx) {
    if (!data || !data.type || !data.msg /* || data.info */) return null;
    if (!canMutate(viewer, data, Models.MESSAGE)) return null;

    let message;
    const newData = Object.keys(data).reduce(
      (acc, curr) => {
        if (!(curr in acc) && curr !== 'info') {
          acc[curr] = data[curr];
        }
        return acc;
      },
      {
        type: data.type,
        msg: data.msg,
        sender_id: viewer.id,
      },
    );

    if (trx) {
      message = await knex('messages')
        .transacting(trx)
        .insert(newData)
        .returning('*');
    } else {
      message = await knex('messages')
        .insert(newData)
        .returning('*');
    }

    message = message[0]; // eslint-disable-line

    if (message) {
      /* EventManager.publish('onMessageCreated', {
        viewer,
        message: { ...message, targetType: data.info.targetType },
        subjectId: data.info.targetId,
      }); */
    }
    return message ? new Message(message) : null;
  }
}

export default Message;
