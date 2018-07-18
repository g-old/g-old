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
import updateUser from './mutations/updateUser';
import deleteUser from './mutations/deleteUser';
import user from './queries/user';

/* GENERATOR */

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      intl,
      user,
      /* GENERATOR_QUERIES */
    },
  }),
  mutation: new ObjectType({
    name: 'Mutations',
    fields: {
      updateUser,
      deleteUser,
      /* GENERATOR_MUTATIONS */
    },
  }),
});

export default schema;
