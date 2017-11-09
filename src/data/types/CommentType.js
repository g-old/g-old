import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
} from 'graphql';
import knex from '../knex';

import UserType from './UserType';
import User from '../models/User';

const CommentType = new ObjectType({
  name: 'Comment',
  fields: () => ({
    id: {
      type: ID,
    },

    content: {
      type: GraphQLString,
    },
    author: {
      type: UserType,
      resolve: (data, args, { viewer, loaders }) =>
        User.gen(viewer, data.authorId, loaders),
    },
    discussionId: {
      type: ID,
    },
    replies: {
      type: new GraphQLList(CommentType),
      resolve: (data, args, { viewer, loaders }) =>
        data.numReplies
          ? knex('comments')
              .where({ discussion_id: data.discussionId })
              .where({ parent_id: data.parent_id })
              .pluck('id')
              .then(ids => ids.map(id => Comment.gen(viewer, id, loaders)))
          : 0,
    },
    parentId: {
      type: ID,
    },
    numReplies: {
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

export default CommentType;
