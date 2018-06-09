import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
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

const localeMapper = { 'de-DE': 'de', 'it-IT': 'it', 'lld-IT': 'lld' };
const MessageType = new ObjectType({
  name: 'Message',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
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
      resolve: (parent, args, { viewer, loaders }) =>
        parent.parentId
          ? knex
              .raw(
                'with recursive parentmessages(id, parent_id) as ( select c.id, c.parent_id from messages c where c.id = ? union all select messages.id, messages.parent_id from messages join parentmessages on parentmessages.parent_id = messages.id) select * from parentmessages;',
                [parent.parentId],
              )
              .then(data =>
                data.rows.map(m => Message.gen(viewer, m.id, loaders)),
              )
          : null,
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
      type: GraphQLString,
    },
  }),
});
export default MessageType;
