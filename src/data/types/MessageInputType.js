import {
  GraphQLInputObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';

import RecipientTypeEnum from './RecipientTypeEnum';
import MessageTypeEnum from './MessageTypeEnum';
import NoteInputType from './NoteInputType';
import TranslationInputType from './TranslationInputType';
import CommunicationInputType from './CommunicationInputType';

const MessageInputType = new GraphQLInputObjectType({
  name: 'MessageInput',
  fields: {
    parentId: {
      type: GraphQLID,
    },
    note: {
      type: NoteInputType,
    },
    communication: {
      type: CommunicationInputType,
    },

    subject: {
      type: TranslationInputType,
    },
    enforceEmail: {
      type: GraphQLBoolean,
    },

    isDraft: {
      type: GraphQLBoolean,
    },

    recipients: {
      type: new GraphQLList(GraphQLID),
    },
    recipientType: { type: RecipientTypeEnum },
    messageType: { type: MessageTypeEnum },
  },
});
export default MessageInputType;
