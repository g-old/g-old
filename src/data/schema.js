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
import users from './queries/users';
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
import notify from './mutations/sendNotification';
import activities from './subscriptions/activities';
import createGroup from './mutations/createGroup';
import joinGroup from './mutations/joinGroup';
import leaveGroup from './mutations/leaveGroup';
import groups from './queries/groups';
import group from './queries/group';
import createProposalSub from './mutations/createProposalSub';
import deleteProposalSub from './mutations/deleteProposalSub';
import logs from './queries/logs';
import statistics from './queries/statistics';
import userConnection from './queries/userConnection';
import createComment from './mutations/createComment';
import updateComment from './mutations/updateComment';
import deleteComment from './mutations/deleteComment';
import createDiscussion from './mutations/createDiscussion';
import discussion from './queries/discussion';
import comments from './queries/comments';
import createRequest from './mutations/createRequest';
import updateRequest from './mutations/updateRequest';
import deleteRequest from './mutations/deleteRequest';
import requestConnection from './queries/requestConnection';
import updateGroup from './mutations/updateGroup';
import createTag from './mutations/createTag';
import updateTag from './mutations/updateTag';
import deleteTag from './mutations/deleteTag';
import platform from './queries/platform';
import createPlatform from './mutations/createPlatform';
import updatePlatform from './mutations/updatePlatform';
import deletePlatform from './mutations/deletePlatform';
import createAsset from './mutations/createAsset';
import updateAsset from './mutations/updateAsset';
import deleteAsset from './mutations/deleteAsset';
import assetConnection from './queries/assetConnection';
/* GENERATOR */

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      intl,
      proposalDL,
      proposalsDL,
      users,
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
      groups,
      group,
      logs,
      statistics,
      discussion,
      comments,
      requestConnection,
      platform,
      assetConnection,
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
      notify,
      createGroup,
      joinGroup,
      leaveGroup,
      createProposalSub,
      deleteProposalSub,
      createComment,
      updateComment,
      deleteComment,
      createDiscussion,
      createRequest,
      updateRequest,
      deleteRequest,
      updateGroup,
      createTag,
      updateTag,
      deleteTag,
      createPlatform,
      updatePlatform,
      deletePlatform,
      createAsset,
      updateAsset,
      deleteAsset,
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
