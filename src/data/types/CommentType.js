import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import knex from '../knex';

import UserType from './UserType';
import User from '../models/User';

// @flow
/* must be defined before CommentType (recursive type) */
export type tCommentType = {
  __typename: 'Comment',
  id: number,
  content: string,
  author: typeof UserType,
  discussionId: number,
  replies: tCommentType,
  parentId: number,
  numReplies: number,
  createdAt: string,
  updatedAt: string,
  editedAt: string,
};

const CommentType: tCommentType = new ObjectType({
  name: 'Comment',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(ID),
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
    editedAt: {
      type: GraphQLString,
    },
  }),
});

export default CommentType;
