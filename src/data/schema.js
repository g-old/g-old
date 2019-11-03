/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import intl from './queries/intl';
import votes from './queries/votes';
import createStatement from './mutations/createStatement';
import deleteStatement from './mutations/deleteStatement';
import updateStatement from './mutations/updateStatement';
import createStatementLike from './mutations/createStatementLike';
import deleteStatementLike from './mutations/deleteStatementLike';
import proposalDL from './queries/proposalDL';
import proposalsDL from './queries/proposalsDL';
import createVote from './mutations/createVote';
import updateVote from './mutations/updateVote';
import deleteVote from './mutations/deleteVote';
import createProposal from './mutations/createProposal';
import updateProposal from './mutations/updateProposal';
// import createUser from './mutations/createUser';
import updateUser from './mutations/updateUser';
import deleteUser from './mutations/deleteUser';
import uploadAvatar from './mutations/uploadAvatar';
import searchUser from './queries/search';
import user from './queries/user';
import tags from './queries/tags';
import flaggedStatements from './queries/flaggedStatements';
import flag from './mutations/createFlaggedStatement';
import solveFlag from './mutations/updateFlaggedStatement';
import feed from './queries/feed';
import pollingModes from './queries/pollingModes';
import proposalConnection from './queries/proposalConnection';
import flagConnection from './queries/flagConnection';
import createPushSub from './mutations/createPushSub';
import deletePushSub from './mutations/deletePushSub';
import createMessage from './mutations/createMessage';
import updateMessage from './mutations/updateMessage';
import activities from './subscriptions/activities';
import createWorkTeam from './mutations/createWorkTeam';
import deleteWorkteam from './mutations/deleteWorkteam';
import joinWorkTeam from './mutations/joinWorkTeam';
import leaveWorkTeam from './mutations/leaveWorkTeam';
import workTeams from './queries/workTeams';
import workTeam from './queries/workTeam';
import logs from './queries/logs';
import statistics from './queries/statistics';
import userConnection from './queries/userConnection';
import createComment from './mutations/createComment';
import updateComment from './mutations/updateComment';
import deleteComment from './mutations/deleteComment';
import createDiscussion from './mutations/createDiscussion';
import updateDiscussion from './mutations/updateDiscussion';
import discussion from './queries/discussion';
import comments from './queries/comments';
import createRequest from './mutations/createRequest';
import updateRequest from './mutations/updateRequest';
import deleteRequest from './mutations/deleteRequest';
import requestConnection from './queries/requestConnection';
import updateWorkTeam from './mutations/updateWorkTeam';
import createTag from './mutations/createTag';
import updateTag from './mutations/updateTag';
import deleteTag from './mutations/deleteTag';
import createSubscription from './mutations/createSubscription';
import updateSubscription from './mutations/updateSubscription';
import deleteSubscription from './mutations/deleteSubscription';
import subscriptionConnection from './queries/subscriptionConnection';
import createNotification from './mutations/createNotification';
import updateNotification from './mutations/updateNotification';
import deleteNotification from './mutations/deleteNotification';
import notificationConnection from './queries/notificationConnection';
import clearNotifications from './mutations/clearNotifications';
import message from './queries/message';
import messageConnection from './queries/messageConnection';
import discussionConnection from './queries/discussionConnection';
import activityConnection from './queries/activityConnection';
import createCommentVote from './mutations/createCommentVote';
import updateCommentVote from './mutations/updateCommentVote';
import deleteCommentVote from './mutations/deleteCommentVote';

/* GENERATOR */

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      intl,
      proposalDL,
      proposalsDL,
      userConnection,
      votes,
      searchUser,
      user,
      tags,
      flaggedStatements,
      feed,
      pollingModes,
      proposalConnection,
      flagConnection,
      workTeams,
      workTeam,
      logs,
      statistics,
      discussion,
      comments,
      requestConnection,
      subscriptionConnection,
      notificationConnection,
      discussionConnection,
      message,
      messageConnection,
      activityConnection,
      /* GENERATOR_QUERIES */
    },
  }),
  mutation: new ObjectType({
    name: 'Mutations',
    fields: {
      createStatement,
      updateStatement,
      deleteStatement,
      createStatementLike,
      deleteStatementLike,
      createVote,
      updateVote,
      deleteVote,
      createProposal,
      updateProposal,
      //  createUser,
      updateUser,
      deleteUser,
      uploadAvatar,
      flag,
      solveFlag,
      createPushSub,
      deletePushSub,
      createMessage,
      updateMessage,
      createWorkTeam,
      joinWorkTeam,
      leaveWorkTeam,
      createComment,
      updateComment,
      deleteComment,
      createDiscussion,
      updateDiscussion,
      createRequest,
      updateRequest,
      deleteRequest,
      updateWorkTeam,
      deleteWorkteam,
      createTag,
      updateTag,
      deleteTag,
      createSubscription,
      updateSubscription,
      deleteSubscription,
      createNotification,
      updateNotification,
      deleteNotification,
      clearNotifications,
      createCommentVote,
      updateCommentVote,
      deleteCommentVote,
      /* GENERATOR_MUTATIONS */
    },
  }),
  subscription: new ObjectType({
    name: 'Subscriptions',
    fields: {
      activities,
    },
  }),
});

export default schema;
