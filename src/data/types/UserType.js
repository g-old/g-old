import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
} from 'graphql';

import knex from '../knex';

import WorkTeamType from './WorkTeamType';
import WorkTeam from '../models/WorkTeam';
import User from '../models/User';
import { Permissions } from '../../organization';

/* eslint-disable */
const canSee = (viewer, data) =>
  data.id == viewer.id || (viewer & Permissions.VIEW_USER_INFO) > 0;
/* eslint-enable */

const UserType = new ObjectType({
  name: 'User',
  fields: () => ({
    // we need a lazy evaluated fn , bc we use UserType, which has to be defined
    id: { type: ID },
    name: {
      type: GraphQLString,
    },
    surname: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
      resolve(data, args, { viewer }) {
        return canSee(viewer, data) ? data.email : null;
      },
    },
    avatar: {
      type: GraphQLString,
    },
    emailVerified: {
      type: GraphQLBoolean,
      resolve(data, args, { viewer }) {
        return canSee(viewer, data) ? data.emailVerified : null;
      },
    },
    lastLogin: {
      type: GraphQLString,
      resolve(data, args, { viewer }) {
        return canSee(viewer, data) ? data.lastLogin : null;
      },
    },
    createdAt: {
      type: GraphQLString,
    },
    groups: {
      type: GraphQLInt,
    },
    followees: {
      type: new GraphQLList(UserType),
      resolve: (data, args, { viewer, loaders }) =>
        User.followees(viewer, data.id, loaders).then(ids =>
          ids.map(id => User.gen(viewer, id, loaders)),
        ),
    },

    numFollowers: {
      type: GraphQLInt,
      resolve: (data, args, { viewer }) => {
        if (viewer) {
          return knex('user_follows')
            .where({ followee_id: data.id })
            .count('id')
            .then(countData => Number(countData[0].count));
        }
        return 0;
      },
    },

    numStatements: {
      type: GraphQLInt,
      resolve: (data, args, { viewer }) => {
        if (viewer) {
          return knex('statements')
            .where({ author_id: data.id })
            .count('id')
            .then(countData => Number(countData[0].count));
        }
        return 0;
      },
    },

    numLikes: {
      type: GraphQLInt,
      resolve: (data, args, { viewer }) => {
        if (viewer) {
          return knex('statements')
            .where({ author_id: data.id })
            .innerJoin('statement_likes', 'statement_id', 'statements.id')
            .count('statement_likes.id')
            .then(countData => Number(countData[0].count));
        }
        return 0;
      },
    },

    workTeams: {
      type: new GraphQLList(WorkTeamType),
      resolve: (data, args, { viewer, loaders }) => {
        if (viewer) {
          return knex('user_work_teams')
            .where({ user_id: data.id })
            .innerJoin(
              'work_teams',
              'work_teams.id',
              'user_work_teams.work_team_id',
            )
            .select()
            .then(wts => wts.map(wt => WorkTeam.gen(viewer, wt.id, loaders)));
        }
        return null;
      },
    },
  }),
});

export default UserType;
