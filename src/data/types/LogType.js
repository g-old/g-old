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
        if (parent.type === 'statement') {
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
        if (parent.type === 'vote') {
          return new Vote({
            id: parent.content.id,
            user_id: parent.content.userId,
            position: parent.content.position,
            poll_id: parent.content.pollId,
          });
        }
        if (parent.type === 'notification') {
          return Notification.gen(viewer, parent.objectId, loaders);
        }
        return null;
      },
    },
    createdAt: {
      type: GraphQLString,
    },
  },
});
export default LogType;
