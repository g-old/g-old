import {
  GraphQLList,
  GraphQLObjectType as ObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import User from '../models/User';
import UserType from './UserType';
import PositionType from './PositionType';

const VoteType = new ObjectType({
  name: 'VoteDL',

  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    positions: {
      type: new GraphQLList(PositionType),
    },
    voter: {
      type: UserType,
      resolve: (parent, args, { viewer, loaders }) =>
        User.gen(viewer, parent.userId, loaders),
    },
    pollId: {
      type: GraphQLID,
    },
  }),
});
export default VoteType;
