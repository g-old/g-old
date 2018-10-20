import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import User from '../models/User';
/* eslint-disable import/no-cycle */
import UserType from './UserType';
import ObjectType from './ObjectType';
/* eslint-enable import/no-cycle */

import Message from '../models/Message';
import Proposal from '../models/Proposal';
import Statement from '../models/Statement';
import Vote from '../models/Vote';
import Discussion from '../models/Discussion';
import Comment from '../models/Comment';
import WorkTeam from '../models/WorkTeam';
import Request from '../models/Request';
import { ActivityType as AType } from '../models/Activity';

const addProposalInfo = async (viewer, loaders, pollId, data = {}) => {
  if (!pollId) {
    return JSON.stringify({});
  }
  const { id, title } = await Proposal.genByPoll(viewer, pollId, loaders);

  return JSON.stringify({ proposalId: id, proposalTitle: title, ...data });
};

const addWorkTeamInfo = async (viewer, loaders, workTeamId) => {
  if (!workTeamId) {
    return JSON.stringify({});
  }
  const { id, name, deName, itName, lldName, logo } = await WorkTeam.gen(
    viewer,
    workTeamId,
    loaders,
  );

  return JSON.stringify({
    workTeamId: id,
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
  const { workTeamId, title } = await Discussion.gen(
    viewer,
    discussionId,
    loaders,
  );
  return JSON.stringify({
    workTeamId,
    title,
  });
};

const getVote = (viewer, parent, loaders) => {
  let vote;
  if (parent.verb === 'delete') {
    vote = new Vote({
      id: parent.content.id,
      user_id: parent.content.userId,
      positions: parent.content.positions,
      poll_id: parent.content.pollId,
    });
  } else {
    if (parent.verb === 'update') {
      loaders.votes.clear(parent.objectId);
    }
    vote = new Vote({
      id: parent.content.id,
      user_id: parent.content.userId,
      positions: parent.content.positions,
      poll_id: parent.content.pollId,
    }); // await Vote.gen(viewer, parent.objectId, loaders);
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

  fields: () => ({
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
        let result;
        if (parent.type === AType.PROPOSAL) {
          if (parent.verb === 'update') {
            loaders.proposals.clear(parent.objectId);
            loaders.polls.clearAll(); // or specify
          }
          result = await Proposal.gen(viewer, parent.objectId, loaders);
          if (result.deletedAt) {
            return new Proposal({
              id: result.id,
              deleted_at: result.deletedAt,
              work_team_id: result.workTeamId,
            });
          }

          return result;
        }
        if (parent.type === AType.STATEMENT) {
          return getStatement(viewer, parent, loaders);
        }
        if (parent.type === AType.VOTE) {
          return getVote(viewer, parent, loaders);
        }
        if (parent.type === AType.MESSAGE) {
          return Message.gen(viewer, parent.objectId, loaders);
        }
        if (parent.type === AType.DISCUSSION) {
          result = await Discussion.gen(viewer, parent.objectId, loaders);
          if (result.deletedAt) {
            return new Discussion({
              id: result.id,
              deleted_at: result.deletedAt,
              work_team_id: result.workTeamId,
            });
          }

          return result;
        }
        if (parent.type === AType.COMMENT) {
          return Comment.gen(viewer, parent.objectId, loaders);
        }
        if (parent.type === AType.USER) {
          return User.gen(viewer, parent.objectId, loaders);
        }
        if (parent.type === AType.REQUEST) {
          return Request.gen(viewer, parent.objectId, loaders);
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
          case AType.STATEMENT: {
            const statement = await getStatement(viewer, parent, loaders);
            return addProposalInfo(viewer, loaders, statement.pollId);
          }
          case AType.VOTE: {
            const vote = getVote(viewer, parent, loaders);
            return addProposalInfo(viewer, loaders, vote && vote.pollId, {
              extended: parent.content.extended,
            });
          }
          case AType.PROPOSAL: {
            return addWorkTeamInfo(viewer, loaders, parent.content.workTeamId);
          }

          case AType.DISCUSSION: {
            return addWorkTeamInfo(viewer, loaders, parent.content.workTeamId);
          }
          case AType.COMMENT: {
            return addDiscussionInfo(
              viewer,
              loaders,
              parent.content.discussionId,
            );
          }

          case AType.USER: {
            return JSON.stringify({
              added: parent.content.added,
              changedField: parent.content.changedField,
              diff: parent.content.diff,
            });
          }

          default: {
            return JSON.stringify({});
          }
        }
      },
    },
  }),
});
export default ActivityType;
