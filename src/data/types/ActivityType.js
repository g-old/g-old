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
import Proposal from '../models/Proposal';
import Statement from '../models/Statement';
import Vote from '../models/Vote';
import Discussion from '../models/Discussion';
import Comment from '../models/Comment';
import Group from '../models/Group';

const addProposalInfo = async (viewer, loaders, pollId) => {
  if (!pollId) {
    return JSON.stringify({});
  }
  const { id, title } = await Proposal.genByPoll(viewer, pollId, loaders);

  return JSON.stringify({ proposalId: id, proposalTitle: title });
};

const addGroupInfo = async (viewer, loaders, groupId) => {
  if (!groupId) {
    return JSON.stringify({});
  }
  const { id, name, deName, itName, lldName, logo } = await Group.gen(
    viewer,
    groupId,
    loaders,
  );

  return JSON.stringify({
    groupId: id,
    name,
    logo,
    itName,
    deName,
    lldName,
  });
};

// TODO store this in activity - would not be a problem
const addDiscussionInfo = async (viewer, loaders, discussionId) => {
  if (!discussionId) {
    return JSON.stringify({});
  }
  const { groupId, title } = await Discussion.gen(
    viewer,
    discussionId,
    loaders,
  );
  return JSON.stringify({
    groupId,
    title,
  });
};

const getVote = async (viewer, parent, loaders) => {
  let vote;
  if (parent.verb === 'delete') {
    vote = new Vote({
      id: parent.content.id,
      user_id: parent.content.userId,
      position: parent.content.position,
      poll_id: parent.content.pollId,
    });
  } else {
    vote = await Vote.gen(viewer, parent.objectId, loaders);
  }
  return vote;
};

const getStatement = async (viewer, parent, loaders) => {
  let statement;
  if (parent.verb === 'delete') {
    statement = new Statement({
      id: parent.content.id,
      poll_id: parent.content.pollId,
    });
  } else {
    if (parent.verb === 'update') {
      loaders.statements.clear(parent.objectId);
    }
    // clear votes loader, bc if user changed vote, it will return wrong values
    loaders.votes.clear(parent.content.voteId);

    statement = await Statement.gen(viewer, parent.objectId, loaders);
  }
  return statement;
};

const ActivityType = new GraphQLObjectType({
  name: 'Activity',

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
      resolve: async (parent, args, { viewer, loaders }) => {
        if (parent.type === 'proposal') {
          if (parent.verb === 'update') {
            loaders.proposals.clear(parent.objectId);
            loaders.polls.clearAll(); // or specify
          }
          return Proposal.gen(viewer, parent.objectId, loaders);
        }
        if (parent.type === 'statement') {
          return getStatement(viewer, parent, loaders);
        }
        if (parent.type === 'vote') {
          return getVote(viewer, parent, loaders);
        }
        if (parent.type === 'notification') {
          return Notification.gen(viewer, parent.objectId, loaders);
        }
        if (parent.type === 'discussion') {
          return Discussion.gen(viewer, parent.objectId, loaders);
        }
        if (parent.type === 'comment') {
          return Comment.gen(viewer, parent.objectId, loaders);
        }
        return null;
      },
    },
    createdAt: {
      type: GraphQLString,
    },
    info: {
      type: GraphQLString,
      resolve: async (parent, args, { viewer, loaders }) => {
        switch (parent.type) {
          case 'statement': {
            const statement = await getStatement(viewer, parent, loaders);

            return addProposalInfo(
              viewer,
              loaders,
              statement.pollId,
              statement,
            );
          }
          case 'vote': {
            const vote = await getVote(viewer, parent, loaders);

            return addProposalInfo(viewer, loaders, vote.pollId, vote);
          }
          case 'proposal': {
            return addGroupInfo(viewer, loaders, parent.content.groupId);
          }

          case 'discussion': {
            return addGroupInfo(viewer, loaders, parent.content.groupId);
          }
          case 'comment': {
            return addDiscussionInfo(
              viewer,
              loaders,
              parent.content.discussionId,
            );
          }

          default: {
            return JSON.stringify({});
          }
        }
      },
    },
  },
});
export default ActivityType;
