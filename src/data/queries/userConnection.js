import { GraphQLBoolean } from 'graphql';

import UserType from '../types/UserType';
import UserFilter from '../types/UserFilterType';
import User from '../models/User';
import knex from '../knex';
import { createConnection } from '../utils';

const allUsers = createConnection(
  UserType,
  User,
  async (viewer, { cursorDate, cursorId, batchSize = 10 }, args) => {
    const filter = args.filterBy;

    return knex('users')
      .whereRaw('(users.created_at, users.id) < (?,?)', [cursorDate, cursorId])
      .modify(queryBuilder => {
        const filterArgs = {};
        if (filter.verificationStatus) {
          filterArgs.verification_status = filter.verificationStatus;
        }
        if (filter.groups) {
          if (args.asUnion) {
            queryBuilder.whereRaw('groups & ? > 0', [filter.groups]);
          } else {
            filterArgs.groups = filter.groups;
          }
        }
        queryBuilder.where(filterArgs);
      })
      .limit(batchSize)
      .orderBy('users.created_at', 'desc')
      .orderBy('users.id', 'desc')
      .select('users.id as id', 'users.created_at as time');
  },
  {
    filterBy: {
      type: UserFilter,
    },
    asUnion: {
      type: GraphQLBoolean,
    },
  },
);

export default allUsers;
