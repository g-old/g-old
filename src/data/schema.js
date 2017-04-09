/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { GraphQLSchema as Schema, GraphQLObjectType as ObjectType } from 'graphql';

import intl from './queries/intl';
import proposal from './queries/proposal';
import proposals from './queries/proposals';
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
import uploadAvatar from './mutations/uploadAvatar';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      intl,
      proposal,
      proposals,
      proposalDL,
      proposalsDL,
      users,
      votes,
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
      uploadAvatar,
    },
  }),
});

export default schema;
