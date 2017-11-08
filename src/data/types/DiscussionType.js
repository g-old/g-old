import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
} from 'graphql';
import knex from '../knex';

import WorkTeamType from './WorkTeamType';
import WorkTeam from '../models/WorkTeam';
import CommentType from './CommentType';
import Comment from '../models/Comment';
import UserType from './UserType';
import User from '../models/User';

const DiscussionType = new ObjectType({
  name: 'Discussion',
  fields: () => ({
    id: {
      type: ID,
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
    comments: {
      type: new GraphQLList(CommentType),
      resolve: (data, args, { viewer, loaders }) =>
        knex('comments')
          .where({ discussion_id: data.id })
          .where({ parent_id: null })
          .pluck('id')
          .then(ids => ids.map(id => Comment.gen(viewer, id, loaders))),
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
  }),
});

export default DiscussionType;
