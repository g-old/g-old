import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import User from '../models/User';
import UserType from './UserType';
import ObjectType from './ObjectType';
import Message from '../models/Message';
// import Proposal from '../models/Proposal';
import Statement from '../models/Statement';
import Vote from '../models/Vote';
import Comment from '../models/Comment';
import Request from '../models/Request';
import { ActivityType } from '../models/Activity';
import GraphQLDate from './GraphQLDateType';

const LogType = new GraphQLObjectType({
  name: 'Log',

  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    // not sure if this is the right way as we have to make a system user
    actor: {
      type: UserType,
      resolve: (parent, args, { viewer, loaders }) =>
        User.gen(viewer, parent.actorId, loaders),
    },
    type: {
      type: GraphQLString, // or enum?
    },
    verb: {
      type: GraphQLString, // or enum?
    },
    objectId: {
      type: GraphQLID,
    },
    object: {
      type: ObjectType,
      resolve: (parent, args, { viewer, loaders }) => {
        switch (parent.type) {
          case 'statement': {
            const s = parent.content;
            return new Statement({
              id: s.id,
              poll_id: s.pollId,
              author_id: s.author_id,
              created_at: s.createdAt,
              deleted_at: s.deletedAt,
              updated_at: s.updatedAt,
              likes: s.likes,
              vote_id: s.voteId,
              body: s.text,
            });
          }

          case 'vote': {
            return new Vote({
              id: parent.content.id,
              user_id: parent.content.userId,
              positions: parent.content.positions,
              poll_id: parent.content.pollId,
            });
          }

          case 'message': {
            return Message.gen(viewer, parent.objectId, loaders);
          }

          case 'user': {
            const data = parent.content;
            return new User({
              id: data.id,
              name: data.name,
              surname: data.surname,
              groups: data.groups,
              email: data.email,
              thumbnail: data.thumbnail,
            });
          }

          case 'comment': {
            const c = parent.content;
            return new Comment({
              id: c.id,
              author_id: c.authorId,
              discussion_id: c.discussionId,
              content: c.content,
              parent_id: c.parentId,
              num_replies: c.numReplies,
              created_at: c.createdAt,
              updated_at: c.updatedAt,
              edited_At: c.editedAt,
            });
          }

          case 'request': {
            const c = parent.content;
            return new Request({
              id: c.id,
              content: c.content,
              created_at: c.createdAt,
              updated_at: c.updatedAt,
              denied_At: c.deniedAt,
              type: c.type,
              requester_id: c.requesterId,
              processor_id: c.processorId,
            });
          }

          default: {
            throw new Error(`Log parent type not recognized: ${parent.type}`);
          }
        }
      },
    },
    info: {
      type: GraphQLString,
      resolve(parent) {
        if (parent.type === ActivityType.USER) {
          return JSON.stringify({
            changedField: parent.content.changedField,
            changedValue: parent.content.changedValue,
            diff: parent.content.diff,
            added: parent.content.added,
          });
        }
        if (parent.type === ActivityType.VOTE) {
          return JSON.stringify({
            extended: parent.content.extended,
            positionAdded: parent.content.positionAdded,
          });
        }
        return JSON.stringify({});
      },
    },
    createdAt: {
      type: GraphQLDate,
    },
  },
});
export default LogType;
