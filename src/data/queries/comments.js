import { GraphQLID, GraphQLList } from 'graphql';
import knex from '../knex';

import CommentType from '../types/CommentType';
import Comment from '../models/Comment';

// TODO make connection
const comments = {
  type: new GraphQLList(CommentType),
  args: {
    parentId: {
      type: GraphQLID,
    },
  },
  resolve: (data, { parentId }, { viewer, loaders }) =>
    //  throw Error('TESTERROR');
    knex('comments')
      .where({ parent_id: parentId })
      .orderBy('created_at', 'desc')
      .pluck('id')
      .then(ids => ids.map(id => Comment.gen(viewer, id, loaders))),
};

export default comments;
