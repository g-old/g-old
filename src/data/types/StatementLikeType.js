import {
  GraphQLObjectType as ObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import User from '../models/User';
import UserType from './UserType';

const StatementLikeType = new ObjectType({
  name: 'StatementLikeType',

  fields: {

    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    author: {
      type: UserType,
      // resolve: (data) => data.user_id,
      resolve: (parent, { id }, { viewer, loaders }) => User.gen(viewer, parent.userId, loaders),
    },
    statement: {
      type: new GraphQLNonNull(GraphQLID),
    },

  },

});
export default StatementLikeType;
