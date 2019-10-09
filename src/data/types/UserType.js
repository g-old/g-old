import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLBoolean,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';

import knex from '../knex';
/* eslint-disable import/no-cycle */
import WorkTeamType from './WorkTeamType';
import NotificationType from './NotificationType';
import MessageType from './MessageType';
import requestConnection from '../queries/requestConnection';
import VerificationType from './VerificationType';
/* eslint-enable import/no-cycle */
import WorkTeam from '../models/WorkTeam';
import Notification from '../models/Notification';
import Message from '../models/Message';
import User from '../models/User';
import { Permissions } from '../../organization';
import GraphQLDate from './GraphQLDateType';
import Verification from '../models/Verification';
import VerificationStatusEnumType from './VerificationStatusEnum';

/* eslint-disable */
const canSee = (viewer, data) =>
  data.id == viewer.id || (viewer.permissions & Permissions.VIEW_USER_INFO) > 0;
/* eslint-enable */

const UserType = new ObjectType({
  name: 'User',
  fields: () => ({
    // we need a lazy evaluated fn , bc we use UserType, which has to be defined
    id: { type: new GraphQLNonNull(ID) },
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
    locale: {
      type: GraphQLString,
    },
    thumbnail: {
      type: GraphQLString,
    },
    emailVerified: {
      type: GraphQLBoolean,
      resolve(data, args, { viewer }) {
        return canSee(viewer, data) ? data.emailVerified : null;
      },
    },
    lastLogin: {
      type: GraphQLDate,
      resolve(data, args, { viewer }) {
        return canSee(viewer, data) ? data.lastLogin : null;
      },
    },
    createdAt: {
      type: GraphQLDate,
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
    verification: {
      type: VerificationType,
      resolve: (parent, args, { viewer, loaders }) =>
        Verification.gen(viewer, parent.id, loaders),
    },
    verificationStatus: {
      type: VerificationStatusEnumType,
    },
    requestConnection,

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
            .where({ user_id: data.id, inactive: false })
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

    messagesSent: {
      type: new GraphQLList(MessageType),
      resolve: (parent, args, { viewer, loaders }) =>
        knex('messages')
          .where({
            message_type: 'communication',
            sender_id: parent.id,
            parent_id: null,
          })
          .orWhere({ message_type: 'notes', sender_id: parent.id })
          .limit(10)
          .orderBy('created_at', 'desc')
          .pluck('id')
          .then(data => data.map(mId => Message.gen(viewer, mId, loaders))),
    },
    messagesReceived: {
      type: new GraphQLList(MessageType),
      resolve: (parent, args, { viewer, loaders }) =>
        knex('messages')
          .where({ recipient_type: 'user' })
          .whereRaw('recipients \\? ?', [parent.id])
          .whereNull('parent_id')
          .orWhere({ recipient_type: 'group' })
          .modify(queryBuilder => {
            if (viewer.id === parent.id) {
              queryBuilder.whereRaw('recipients \\?| ?', [
                viewer.wtMemberships || [],
              ]);
            } else {
              queryBuilder.whereRaw(
                'recipients \\?| ARRAY(SELECT work_team_id::text from user_work_teams WHERE user_id = ?)',
                [parent.id],
              );
            }
          })
          .orWhere({ recipient_type: 'all' })
          .limit(10)
          .orderBy('created_at', 'desc')
          .pluck('id')
          .then(data => data.map(mId => Message.gen(viewer, mId, loaders))),
    },

    notifications: {
      type: new GraphQLList(NotificationType),
      resolve: (parent, args, { viewer, loaders }) => {
        if (viewer) {
          return knex('notifications')
            .where({ user_id: parent.id, read: false })
            .orderBy('created_at', 'desc')
            .pluck('id')
            .then(ids => ids.map(id => Notification.gen(viewer, id, loaders)));
        }
        return [];
      },
    },
    unreadNotifications: {
      type: GraphQLInt,
      resolve: (parent, args, { viewer }) =>
        viewer
          ? knex('notifications')
              .where({ user_id: parent.id, read: false })
              .count('id')
              .then(([count]) => count.count)
          : 0,
    },
    notificationSettings: {
      type: GraphQLString,
      resolve: (parent, agrs, { viewer }) =>
        viewer
          ? knex('notification_settings')
              .where({ user_id: parent.id })
              .select('settings')
              .then(([data]) =>
                data ? JSON.stringify(data.settings || {}) : JSON.stringify({}),
              )
          : {},
    },
  }),
});

export default UserType;
