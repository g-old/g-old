// @flow

import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import EventManager from '../../core/EventManager';
import Note from './Note';
import Communication from './Communication';
import log from '../../logger';
import createLoaders from '../../data/dataLoader';

export type MessageType = 'communication' | 'note' | 'meeting';

type RecipientType = 'user' | 'group';
class Message {
  recipientType: RecipientType;
  id: ID;
  messageHtml: string;
  subject: string;
  senderId: ID;
  messageType: MessageType;
  objectId: ID;
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
        let object = {};
        if (data.messageType === 'note') {
          if (data.note.id) {
            object = await Note.gen(viewer, data.note.id, loaders);
          } else {
            object = await Note.create(viewer, data.note, loaders, tra);
          }
        } else if (data.messageType === 'communication') {
          object = await Communication.create(
            viewer,
            data.communication,
            loaders,
            tra,
          );
        }

        newData.message_object_id = object.id;
        if (!newData.message_object_id) {
          throw new Error('Object id cannot be null');
        }

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
        message: {
          ...message,
          targetType: message.recipientType,
          messageType: message.messageType,
          objectId: message.objectId,
        },
        subjectId: message.recipients[0],
      });
    }
    return message ? new Message(message) : null;
  }
}

export default Message;

const userStatusTranslations = {
  subject: {
    Added: {
      de: 'Neue Rechte erhalten!',
      it: 'translate:Neue Rechte erhalten!',
      lld: 'tranlate: Neue Rechte erhalten!',
    },
    Lost: {
      de: 'Achtung, sie haben eine Berechtigung verloren!',
      it: 'translate:Achtung, sie haben eine Berechtigung verloren!',
      lld: 'translate: Achtung, sie haben eine Berechtigung verloren!',
    },
  },
  VIEWERAdded: {
    de:
      'Sie sind als Viewer freigeschalten worden. Ab sofort können Sie einer Arbeitsgruppe beitreten, bei Umfragen abstimmen und Beiträge, Beschlüsse sowie Diskussionen lesen.',
    it:
      'translate: Sie sind als Viewer freigeschalten worden. Ab sofort können Sie einer Arbeitsgruppe beitreten, bei Umfragen abstimmen und Beiträge, Beschlüsse sowie Diskussionen lesen.',
    lld:
      'translate: Sie sind als Viewer freigeschalten worden. Ab sofort können Sie einer Arbeitsgruppe beitreten, bei Umfragen abstimmen und Beiträge, Beschlüsse sowie Diskussionen lesen.',
  },
  VIEWERLost: {
    de:
      'Sie besitzen nun nicht mehr die Berechtigungen eines Viewers. Bis auf weiteres können Sie an keinen Aktivitäten der Plattformen teilnehmen. Wenn Sie glauben, das hier ein Fehler vorliegt, wenden sie sich bitte xxx oder schreiben Sie eine E-Mail an xxx@xxx.xx',
    it:
      'translate: Sie besitzen nun nicht mehr die Berechtigungen eines Viewers. Bis auf weiteres können Sie an keinen Aktivitäten der Plattformen teilnehmen. Wenn Sie glauben, das hier ein Fehler vorliegt, wenden sie sich bitte xxx oder schreiben Sie eine E-Mail an xxx@xxx.xx',
    lld:
      'translate: Sie besitzen nun nicht mehr die Berechtigungen eines Viewers. Bis auf weiteres können Sie an keinen Aktivitäten der Plattformen teilnehmen. Wenn Sie glauben, das hier ein Fehler vorliegt, wenden sie sich bitte xxx oder schreiben Sie eine E-Mail an xxx@xxx.xx',
  },

  VOTERAdded: {
    de:
      'Sie sind als Voter freigschalten worden. Ab sofort sind Sie uneingeschränktes Mitglied und können  an allen Abstimmungen teilnehmen, sowie Kommentare und Erklärungen verfassen.',
    it:
      'translate: Sie sind als Voter freigschalten worden. Ab sofort sind Sie uneingeschränktes Mitglied und können  an allen Abstimmungen teilnehmen, sowie Kommentare und Erklärungen verfassen.',
    lld:
      'translate: Sie sind als Voter freigschalten worden. Ab sofort sind Sie uneingeschränktes Mitglied und können  an allen Abstimmungen teilnehmen, sowie Kommentare und Erklärungen verfassen.',
  },
  VOTERLost: {
    de:
      'Sie sind ab nun kein stimmberechtigtes Mitglied der Plattform.Wenn Sie glauben, das hier ein Fehler vorliegt, wenden sie sich bitte xxx oder schreiben Sie eine E-Mail an xxx@xxx.xx',
    it:
      'translate:Sie sind ab nun kein stimmberechtigtes Mitglied der Plattform.Wenn Sie glauben, das hier ein Fehler vorliegt, wenden sie sich bitte xxx oder schreiben Sie eine E-Mail an xxx@xxx.xx',
    lld:
      'translate:Sie sind ab nun kein stimmberechtigtes Mitglied der Plattform.Wenn Sie glauben, das hier ein Fehler vorliegt, wenden sie sich bitte xxx oder schreiben Sie eine E-Mail an xxx@xxx.xx',
  },

  'de-DE': {
    roleAdded: (name, role, helpText) => `Hallo ${name},\n
    wird haben Sie als ${role} freigeschalten.\n${helpText}`,
    roleLost: (name, role) => `Hallo ${name},\n
    Sie sind nun nicht mehr ${role}.\n`,
    MODERATOR: 'Als MODERATOR können Sie Beiträge löschen',
    MEMBER_MANAGER: 'Als MEMBER_MANAGER können Sie Mitglieder betreuen ',
    RELATOR:
      'Als RELATOR können Sie Beschlüsse auf der Plattform veröffentlichen',
    VIEWER:
      'Als VIEWER können Sie alle Aktivitäten auf unserer Plattform verfolgen, bei Umfragen abstimmen und mitdiskutieren',
    VOTER: 'Als VOTER haben sie das Recht, bei Beschlüssen abzustimmen',
    subject: 'Wichtig - Ihre Profileinstellungen wurden verändert',
  },

  'it-IT': {
    roleAdded: (name, role, helpText) => `Ciao ${name},\n
    hai ricevuto il profile di ${role}.\n${helpText}`,
    roleLost: (name, role) => `Ciao ${name},\n
    non sei più ${role}.\n`,
    RELATOR:
      'Come RELATOR puoi pubblicare proposte e sondaggi, indire delle votazioni e avviare delle discussioni',
    VIEWER: 'Come VIEWER puoi leggere tutto e partecipare ai sondaggi',
    VOTER: 'Come VOTER puoi leggere, commentare e votare',
    subject: 'Attenzione - il suo profile è stato cambiato',
  },
  'lld-IT': {
    roleAdded: (name, role, helpText) => `Ciao ${name},\n
    hai ricevuto il profile di ${role}.\n${helpText}`,
    roleLost: (name, role) => `Ciao ${name},\n
    non sei più ${role}.\n`,
    RELATOR:
      'Come RELATOR puoi pubblicare proposte e sondaggi, indire delle votazioni e avviare delle discussioni',
    VIEWER: 'Come VIEWER puoi leggere tutto e partecipare ai sondaggi',
    VOTER: 'Come VOTER puoi leggere, commentare e votare',
    subject: 'Attenzione - il tuo profile è stato cambiato',
  },
};

EventManager.subscribe('onUserUpdated', async ({ user, viewer }) => {
  try {
    const keyword = user.diff[0] + (user.added ? 'Added' : 'Lost');
    const loaders = createLoaders();
    let note;
    if (user && user.changedField === 'groups') {
      [note = null] = await knex('notes')
        .where({ category: 'groups', keyword })
        .select();

      if (!note) {
        // insert

        const textHtml = userStatusTranslations[keyword]; // import from JSON
        if (textHtml) {
          note = await Note.create(
            viewer,
            { textHtml, category: 'groups', keyword },
            loaders,
          );
        }
      }
      if (!note) {
        throw new Error('Note not found');
      }

      await Message.create(
        viewer,
        {
          subject:
            userStatusTranslations.subject[user.added ? 'Added' : 'Lost'],
          sender: viewer,
          messageType: 'note',
          recipientType: 'user',
          recipients: [user.id],
          enforceEmail: true,
          note: { id: note.id },
        },
        loaders,
      );
    }
  } catch (err) {
    log.error(
      {
        err,
        userId: user.id,
        field: user.changedField,
        diff: (user.diff && user.diff.join()) || '-missing-',
      },
      'Adding status message failed',
    );
  }
});
