import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import User from '../models/User';
import UserType from './UserType';

const VoteType = new ObjectType({
  name: 'VoteDL',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    position: {
      type: GraphQLString,
      resolve: data => data.position,
    },
    voter: {
      type: UserType,
      // resolve: (data) => data.user_id,
      resolve: (parent, args, { viewer, loaders }) =>
        User.gen(viewer, parent.userId, loaders),
    },
    pollId: {
      type: GraphQLID,
    },
  }),
});
export default VoteType;
