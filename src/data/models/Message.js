// @flow

import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';
import Note from './Note';
import Communication from './Communication';

type RecipientType = 'user' | 'group';
class Message {
  recipientType: RecipientType;
  id: ID;
  messageHtml: string;
  subject: string;
  senderId: ID;
  recipients: [ID];
  msg: string;
  createdAt: string;
  message: string;
  constructor(data) {
    this.id = data.id;
    this.recipientType = data.recipient_type;
    this.messageType = data.message_type;
    this.objectId = data.message_object_id;
    this.recipients = data.recipients;
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
    if (!data) {
      return null;
    }
    if (!canMutate(viewer, data, Models.MESSAGE)) return null;
    let message;
    const newData = { created_at: new Date(), sender_id: viewer.id };

    if (data.recipientType) {
      newData.recipient_type = data.recipientType;
    }
    if (data.recipients) {
      if (data.recipients.length) {
        newData.recipients = JSON.stringify(data.recipients);
      } else {
        throw new Error('Atleast one recipient required');
      }
    }
    if (data.subject) {
      newData.subject = data.subject;
    }

    if (trx) {
      message = await knex('messages')
        .transacting(trx)
        .insert(newData)
        .returning('*');
    } else {
      await knex.transaction(async tra => {
        let object;
        if (data.messageType === 'note') {
          object = await Note.create(viewer, data.note, loaders, tra);
        } else if (data.messageType === 'communication') {
          object = await Communication.create(
            viewer,
            data.communication,
            loaders,
            tra,
          );
        }

        newData.message_object_id = object.id;
        newData.message_type = data.messageType;
      });

      message = await knex('messages')
        .insert(newData)
        .returning('*');
    }

    message = message[0]; // eslint-disable-line
    message = message ? new Message(message) : null;
    if (message) {
      EventManager.publish('onMessageCreated', {
        viewer,
        message: { ...message, targetType: message.recipientType },
        subjectId: message.recipients[0],
      });
    }
    return message ? new Message(message) : null;
  }
}

export default Message;
