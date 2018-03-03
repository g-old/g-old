import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import User from '../models/User';
import UserType from './UserType';
import ObjectType from './ObjectType';
import Notification from '../models/Notification';
// import Proposal from '../models/Proposal';
import Statement from '../models/Statement';
import Vote from '../models/Vote';
import Comment from '../models/Comment';
import Request from '../models/Request';

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
              position: s.position,
              vote_id: s.voteId,
              body: s.text,
            });
          }

          case 'vote': {
            return new Vote({
              id: parent.content.id,
              user_id: parent.content.userId,
              position: parent.content.position,
              poll_id: parent.content.pollId,
            });
          }

          case 'notification': {
            return Notification.gen(viewer, parent.objectId, loaders);
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
    createdAt: {
      type: GraphQLString,
    },
  },
});
export default LogType;
