import { GraphQLString, GraphQLObjectType, GraphQLID, GraphQLNonNull } from 'graphql';
import User from '../models/User';
import UserType from './UserType';
import ObjectType from './ObjectType';
import Notification from '../models/Notification';
import Proposal from '../models/Proposal';
import Statement from '../models/Statement';
import Vote from '../models/Vote';

const ActivityType = new GraphQLObjectType({
  name: 'Activity',

  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    // not sure if this is the right way as we have to make a system user
    actor: {
      type: UserType,
      resolve: (parent, args, { viewer, loaders }) => User.gen(viewer, parent.actorId, loaders),
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
        if (parent.type === 'proposal') {
          if (parent.verb === 'update') {
            loaders.proposals.clear(parent.objectId);
            loaders.polls.clearAll(); // or specify
          }
          return Proposal.gen(viewer, parent.objectId, loaders);
        }
        if (parent.type === 'statement') {
          if (parent.verb === 'delete') {
            return new Statement({
              id: parent.content.id,
              poll_id: parent.content.pollId,
            });
          }
          if (parent.verb === 'update') {
            loaders.statements.clear(parent.objectId);
          }
          // clear votes loader, bc if user changed vote, it will return wrong values
          loaders.votes.clear(parent.content.voteId);
          return Statement.gen(viewer, parent.objectId, loaders);
        }
        if (parent.type === 'vote') {
          return Vote.gen(viewer, parent.objectId, loaders);
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
export default ActivityType;
