// @flow

import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import WorkTeam from './WorkTeam';
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
  enforceEmail: boolean;
  constructor(data) {
    this.id = data.id;
    this.recipientType = data.recipient_type;
    this.messageType = data.message_type;
    this.objectId = data.message_object_id;
    this.enforceEmail = data.enforce_email;
    this.recipients = data.recipients;
    this.subject = data.subject;
    this.senderId = data.sender_id;
    this.createdAt = data.created_at;
    this.parentId = data.parent_id;
    this.numReplies = data.num_replies;
  }

  static async gen(viewer, id, { messages }) {
    const data = await messages.load(id);

    if (!data) return null;
    return canSee(viewer, data, Models.MESSAGE) ? new Message(data) : null;
  }

  static async create(viewer, data, loaders, trx) {
    if (!data) {
      return null;
    }
    if (data.parentId) {
      data.isReply = true; // eslint-disable-line no-param-reassign
    }
    if (data.recipientType === 'group' && data.recipients.length) {
      // check if viewer is coordinator of that group
      if (data.recipients.length !== 1) {
        throw new Error('Implement write control for multiple groups');
      }
      const workteam = await WorkTeam.gen(viewer, data.recipients[0], loaders);
      if (workteam.coordinatorId === viewer.id) {
        data.isCoordinator = true; // eslint-disable-line no-param-reassign
      }
    }
    if (!canMutate(viewer, data, Models.MESSAGE)) return null;
    let messageData;
    const newData = { created_at: new Date(), sender_id: viewer.id };

    if (data.recipientType) {
      newData.recipient_type = data.recipientType;
    }
    if (data.recipients) {
      if (data.recipients.length || data.recipientType === 'all') {
        newData.recipients = JSON.stringify(data.recipients || []);
      } else {
        throw new Error('Atleast one recipient required');
      }
    }
    if (data.subject) {
      newData.subject = data.subject;
    }
    if (data.parentId) {
      newData.parent_id = data.parentId;
    }

    if (data.enforceEmail) {
      newData.enforce_email = true;
    }

    if (trx) {
      messageData = await knex('messages')
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
        [messageData = null] = await knex('messages')
          .transacting(tra)
          .insert(newData)
          .returning('*');

        if (newData.parent_id) {
          await knex('messages')
            .transacting(tra)
            .forUpdate()
            .where({ id: newData.parent_id })
            .increment('num_replies', 1);
        }
      });
    }

    const message = messageData ? new Message(messageData) : null;
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
    return message;
  }
}

export default Message;

const helpNotice = {
  de:
    'Wenn Sie glauben, dass hier ein Fehler vorliegt, schreiben Sie eine E-Mail an m5sbz@g-old.org',
  it: 'Se ritieni che ci sia un errore, scrivi una mail a m5sbz@g-old.org',
  lld:
    'Wenn Sie glauben, dass hier ein Fehler vorliegt, schreiben Sie eine E-Mail an m5sbz@g-old.org',
};

const userStatusTranslations = {
  subject: {
    added: {
      de: 'Neue Rechte erhalten!',
      it: 'Il tuo profilo è stato aggiornato!',
      lld: 'tranlate: Neue Rechte erhalten!',
    },
    lost: {
      de: 'Achtung, sie haben eine Berechtigung verloren!',
      it: 'Attenzione, il tuo ruolo è stato modificato!',
      lld: 'translate: Achtung, sie haben eine Berechtigung verloren!',
    },
  },
  viewer_added: {
    de:
      'Sie sind als Viewer freigeschalten worden. Ab sofort können Sie einer Arbeitsgruppe beitreten, bei Umfragen abstimmen, Beiträge und Beschlüsse lesen sowie an Diskussionen teilnehmen.',
    it:
      'Sei stato abilitato come Visitatore e da adesso puoi iscriverti ai gruppi di lavoro, partecipare ai sondaggi, leggere interventi, decisioni e partecipare alle discussioni.',
    lld:
      'translate: Sie sind als Viewer freigeschalten worden. Ab sofort können Sie einer Arbeitsgruppe beitreten, bei Umfragen abstimmen, Beiträge und Beschlüsse lesen sowie an Diskussionen teilnehmen.',
  },
  viewer_lost: {
    de: `Sie besitzen nun nicht mehr die Berechtigungen eines Viewers. Bis auf weiteres können Sie an keinen Aktivitäten der Plattformen teilnehmen. ${
      helpNotice.de
    }`,
    it: `Non sei più abilitato come Visitatore (Viewer), per il momento non potrai più partecipare  alle attività della piattaforma. ${
      helpNotice.it
    }`,
    lld: `translate: Sie besitzen nun nicht mehr die Berechtigungen eines Viewers. Bis auf weiteres können Sie an keinen Aktivitäten der Plattformen teilnehmen. ${
      helpNotice.lld
    }`,
  },

  voter_added: {
    de:
      'Sie sind als Voter freigschalten worden. Ab sofort sind Sie uneingeschränktes Mitglied und können  an allen Abstimmungen teilnehmen, sowie Kommentare und Erklärungen verfassen.',
    it:
      'Sei stato abilitato come Votante (Voter) e da adesso puoi prendere parte a tutte le votazioni e partecipare inserendo sia commenti che dichiarazioni di voto.',
    lld:
      'translate: Sie sind als Voter freigschalten worden. Ab sofort sind Sie uneingeschränktes Mitglied und können  an allen Abstimmungen teilnehmen, sowie Kommentare und Erklärungen verfassen.',
  },
  voter_lost: {
    de: `Sie sind ab jetzt kein stimmberechtigtes Mitglied der Plattform. ${
      helpNotice.de
    }`,
    it: `Da questo momento non hai più il ruolo di Votante sulla piattaforma. ${
      helpNotice.it
    }`,
    lld: `translate: Sie sind ab jetzt kein stimmberechtigtes Mitglied der Plattform. ${
      helpNotice.lld
    }`,
  },

  moderator_added: {
    de:
      'Sie sind als Moderator freigeschalten worden. Ab sofort können Sie Kommentare und Erklärungen löschen.',
    it:
      'Sei stato abilitato come moderatore. Da subito potrai cancellare commenti e dichiarazioni.',
    lld:
      'translate: Sie sind als Moderator freigeschalten worden. Ab sofort können Sie Kommentare und Erklärungen löschen.',
  },
  moderator_lost: {
    de: `Sie sind ab jetzt kein Moderator mehr. ${helpNotice.de}`,
    it: `Da questo momento non sei più moderatore. ${helpNotice.it}`,
    lld: `translate: Sie sind ab jetzt kein Moderator mehr. ${helpNotice.lld}`,
  },

  member_manager_added: {
    de:
      'Sie sind als "Member Manager" freigeschalten worden. Ab sofort können sie andere Benutzer freischalten.',
    it:
      'Sei stato abilitato come gestore utenti ("Member Manger"). Da questo momento potrai accogliere nuovi utenti.',
    lld:
      'translate: Sie sind als "Member Manager" freigeschalten worden. Ab sofort können sie andere Benutzer freischalten.',
  },

  member_manager_lost: {
    de: `Sie sind ab jetzt kein "Member Manager" mehr. ${helpNotice.de}`,
    it: `Da questo momento non sei più un gestore utenti ("Member Manager"). ${
      helpNotice.it
    }`,
    lld: `translate: Sie sind ab jetzt kein "Member Manager" mehr. ${
      helpNotice.lld
    }`,
  },
};

EventManager.subscribe('onUserUpdated', async ({ user, viewer }) => {
  try {
    const keyword = `${user.diff[0].toLowerCase()}_${
      user.added ? 'added' : 'lost'
    }`;
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
            userStatusTranslations.subject[user.added ? 'added' : 'lost'],
          sender: viewer,
          messageType: 'note',
          recipientType: 'user',
          recipients: [user.id],
          enforceEmail: user.added,
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
