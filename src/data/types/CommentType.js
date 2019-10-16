import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import GraphQLDate from './GraphQLDateType';
import knex from '../knex';

import UserType from './UserType';
import User from '../models/User';
import CommentVoteType from './CommentVoteType';
import CommentVote from '../models/CommentVote';
import { commentVoteList } from '../../store/schema';

const CommentType = new ObjectType({
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
    numVotes: {
      type: GraphQLInt,
    },
    ownVote: {
      type: CommentVoteType,
      resolve: async (data, args, { viewer, loaders }) => {
        const commentVote = await knex('comment_votes') // TODO as loader
          .where({ comment_id: data.id, user_id: viewer.id })
          .first('*');

        return commentVote ? new CommentVote(commentVote) : null;
      },
    },

    createdAt: {
      type: GraphQLDate,
    },
    updatedAt: {
      type: GraphQLDate,
    },
    editedAt: {
      type: GraphQLDate,
    },
    deletedAt: {
      type: GraphQLDate,
    },
  }),
});

export default CommentType;
