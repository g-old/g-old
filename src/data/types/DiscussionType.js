import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import knex from '../knex';

import WorkTeamType from './WorkTeamType';
import WorkTeam from '../models/WorkTeam';
import CommentType from './CommentType';
import Comment from '../models/Comment';
import UserType from './UserType';
import User from '../models/User';
import SubscriptionType from './SubscriptionType';
import Subscription, { TargetType } from '../models/Subscription';

const DiscussionType = new ObjectType({
  name: 'Discussion',
  args: {
    parentId: {
      type: ID,
    },
  },
  fields: () => ({
    id: {
      type: new GraphQLNonNull(ID),
    },
    title: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
    },
    author: {
      type: UserType,
      resolve: (data, args, { viewer, loaders }) =>
        User.gen(viewer, data.authorId, loaders),
    },
    workTeam: {
      type: WorkTeamType,
      resolve: (data, args, { viewer, loaders }) =>
        WorkTeam.gen(viewer, data.workTeamId, loaders),
    },
    workTeamId: {
      type: ID,
    },
    // TODO or more
    ownComment: {
      type: CommentType,
      resolve: (data, args, { viewer, loaders }) =>
        knex('comments')
          .where({ author_id: viewer.id })
          .where({ parent_id: null })
          .orderBy('num_replies', 'desc')
          .orderBy('created_at', 'desc')
          .limit(1)
          .pluck('id')
          .then(ids => ids.map(id => Comment.gen(viewer, id, loaders))),
    },

    comments: {
      type: new GraphQLList(CommentType),
      resolve: (data, args, { viewer, loaders }) => {
        // experimental
        if (viewer && viewer.wtMemberships.includes(data.workTeamId)) {
          return knex('comments')
            .where({ discussion_id: data.id })
            .where({ parent_id: null })
            .modify(queryBuilder => {
              if (data.parentId) {
                queryBuilder.orWhere({ parent_id: data.parentId });
              }
            })
            .orderBy('num_replies', 'desc')
            .orderBy('created_at', 'desc')
            .pluck('id')
            .then(ids => ids.map(id => Comment.gen(viewer, id, loaders)));
        }
        return [];
      },
    },
    subscription: {
      type: SubscriptionType,
      resolve: async (parent, args, { viewer, loaders }) =>
        knex('subscriptions')
          .where({
            target_id: parent.id,
            user_id: viewer.id,
            target_type: TargetType.DISCUSSION,
          })
          .pluck('id')
          .then(([id]) => Subscription.gen(viewer, id, loaders)),
    },

    numComments: {
      type: GraphQLInt,
    },

    createdAt: {
      type: GraphQLString,
    },
    updatedAt: {
      type: GraphQLString,
    },
    closedAt: {
      type: GraphQLString,
    },
  }),
});

export default DiscussionType;
