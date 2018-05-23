import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType as ObjectType,
} from 'graphql';
import RecipientType from './RecipientType';
import RecipientTypeEnum from './RecipientTypeEnum';

import UserType from './UserType';
import User from '../models/User';
import WorkTeam from '../models/WorkTeam';

const MessageType = new ObjectType({
  name: 'Message',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    message: {
      type: GraphQLString,
    },
    messageHtml: {
      type: GraphQLString,
    },

    subject: {
      type: GraphQLString,
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
