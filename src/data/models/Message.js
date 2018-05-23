// @flow

import sanitize from 'sanitize-html';
import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';

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
    this.message = data.message;
    this.messageHtml = data.message_html;
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
    if (data.messageHtml) {
      if (data.messageHtml.length > 10000) {
        throw new Error('Message too long!');
      }
      newData.message_html = sanitize(data.messageHtml, {
        allowedTags: [
          'h3',
          'h4',
          'h5',
          'h6',
          'blockquote',
          'p',
          'a',
          'ul',
          'ol',
          'nl',
          'li',
          'b',
          'i',
          'strong',
          'em',
          'strike',
          'code',
          'hr',
          'br',
          'div',
          'table',
          'thead',
          'caption',
          'tbody',
          'tr',
          'th',
          'td',
          'pre',
          'iframe',
          'img',
        ],
        allowedAttributes: {
          a: ['href', 'name', 'target'],
          // We don't currently allow img itself by default, but this
          // would make sense if we did
          img: ['src', 'style'],
        },
        // Lots of these won't come up by default because we don't allow them
        selfClosing: [
          'img',
          'br',
          'hr',
          'area',
          'base',
          'basefont',
          'input',
          'link',
          'meta',
        ],
        // URL schemes we permit
        allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
        allowedSchemesByTag: {},
        allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
        allowProtocolRelative: true,
        allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
        transformTags: {
          img(tagName, attribs) {
            // My own custom magic goes here

            return {
              tagName: 'img',
              attribs: {
                ...attribs,
                style: 'max-width: 100%',
              },
            };
          },
        },
      });
      if (!data.message) {
        newData.message = 'n.m';
      }
    }
    if (data.message) {
      if (data.message.length > 10000) {
        throw new Error('Message too long!');
      }
      newData.message = data.message;
    }
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
