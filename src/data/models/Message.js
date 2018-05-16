// @flow

import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
// import EventManager from '../../core/EventManager';

type ReceiverType = 'user' | 'group';
class Message {
  receiverType: ReceiverType;
  id: ID;
  msgHtml: string;
  subject: string;
  senderId: ID;
  to: [ID];
  msg: string;
  createdAt: string;

  constructor(data) {
    this.id = data.id;
    this.receiverType = data.receiver_type;
    this.msg = data.msg;
    this.msgHtml = data.msg_html;
    this.to = data.to;
    this.subject = data.subject;
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
