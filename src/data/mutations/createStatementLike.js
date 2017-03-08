
import {
  GraphQLNonNull,
} from 'graphql';
import StatementLikeInputType from '../types/StatementLikeInputType';
import StatementLike from '../models/StatementLike';
import StatementLikeType from '../types/StatementLikeType';

const createStatementLike = {
  type: new GraphQLNonNull(StatementLikeType),
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
