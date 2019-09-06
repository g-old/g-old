import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLObjectType as ObjectType,
} from 'graphql';
import RecipientType from './RecipientType';
import RecipientTypeEnum from './RecipientTypeEnum';
import knex from '../knex';
import UserType from './UserType';
import User from '../models/User';
import WorkTeam from '../models/WorkTeam';
import MessageTypeEnum from './MessageTypeEnum';
import MessageObjectType from './MessageObjectType';
import Note from '../models/Note';
import TranslationType from './TranslationType';
import Communication from '../models/Communication';
import Message from '../models/Message';
import GraphQLDate from './GraphQLDateType';

const localeMapper = { 'de-DE': 'de', 'it-IT': 'it', 'lld-IT': 'lld' };
const MessageType = new ObjectType({
  name: 'Message',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    parentId: {
      type: GraphQLID,
    },
    messageType: {
      type: MessageTypeEnum,
    },
    messageObject: {
      type: MessageObjectType,
      resolve(parent, args, { viewer, loaders }) {
        switch (parent.messageType) {
          case 'note':
            return Note.gen(viewer, parent.objectId, loaders);
          case 'communication':
            return Communication.gen(viewer, parent.objectId, loaders);
          default:
            throw new Error(
              `MessageType not recognized: ${parent.messageType}`,
            );
        }
      },
    },

    subjectTranslations: {
      type: TranslationType,
      resolve: parent => parent.subject,
    },

    parents: {
      type: new GraphQLList(MessageType),
      resolve: (parent, args, { viewer, loaders }) => {
        if (parent.parentId) {
          return knex('messages')
            .where({
              parent_id: parent.parentId,
              message_type: parent.messageType,
            })
            .where('created_at', '<', parent.createdAt)
            .orWhere({ id: parent.parentId }) // load parent
            .orderBy('created_at', 'asc')
            .pluck('id')
            .then(ids => ids.map(id => Message.gen(viewer, id, loaders)));
        }
        return null;
      },
    },

    replies: {
      type: new GraphQLList(MessageType),
      resolve: (parent, args, { viewer, loaders }) =>
        knex('messages')
          .where({
            parent_id: parent.parentId || parent.id,
            message_type: parent.messageType,
          })
          .where('created_at', '>', parent.createdAt)
          .orderBy('created_at', 'asc')
          .pluck('id')
          .then(ids => ids.map(id => Message.gen(viewer, id, loaders))),
    },
    numReplies: {
      type: GraphQLInt,
    },
    subject: {
      type: GraphQLString,
      resolve: (parent, args, params, { rootValue }) => {
        const locale = rootValue.request.language;
        if (parent.subject) {
          if (parent.subject[localeMapper[locale]]) {
            return parent.subject[localeMapper[locale]];
          }
          // find one translation that is not emty or default translation
          return Object.values(parent.subject).find(s => s);
        }
        return null;
      },
    },
    recipients: {
      type: new GraphQLList(RecipientType),
      resolve: (parent, args, { viewer, loaders }) => {
        let Model;
        if (parent.recipientType === 'group') {
          Model = WorkTeam;
        } else {
          Model = User;
        }
        return parent.recipients.map(id => Model.gen(viewer, id, loaders));
      },
    },

    sender: {
      type: UserType,
      resolve(parent, args, { viewer, loaders }) {
        return User.gen(viewer, parent.senderId, loaders);
      },
    },

    recipientType: {
      type: RecipientTypeEnum,
    },

    createdAt: {
      type: GraphQLDate,
    },
  }),
});
export default MessageType;
