
import {
  GraphQLNonNull,
} from 'graphql';
import StatementLikeInputType from '../types/StatementLikeInputType';
import StatementLike from '../models/StatementLike';
import StatementLikeType from '../types/StatementLikeType';

const deleteStatementLike = {
  type: new GraphQLNonNull(StatementLikeType),
  args: {
    like: {
      type: StatementLikeInputType,
      description: 'Like a statement',
    },
  },
  resolve: (data, { like }, { viewer, loaders }) =>
    StatementLike.delete(viewer, like, loaders),


};

export default deleteStatementLike;
