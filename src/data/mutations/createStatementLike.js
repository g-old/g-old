
import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import StatementLikeInputType from '../types/StatementLikeInputType';
import StatementLike from '../models/StatementLike';

const createStatementLike = {
  type: new GraphQLNonNull(GraphQLID),
  args: {
    like: {
      type: StatementLikeInputType,
      description: 'Like a statement',
    },
  },
  resolve: (data, { like }, { viewer, loaders }) =>
    StatementLike.create(viewer, like, loaders),


};

export default createStatementLike;
