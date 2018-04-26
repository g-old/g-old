import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import User from '../models/User';
import UserType from './UserType';

// @flow
export type tVoteType = {
  __typename: 'VoteDL',
  id: number,
  position: 'pro' | 'con',
  voter: typeof UserType,
  pollId: number,
};

const VoteType = new ObjectType({
  name: 'VoteDL',

  fields: {
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
      resolve: (parent, _, { viewer, loaders }) =>
        User.gen(viewer, parent.userId, loaders),
    },
    pollId: {
      type: GraphQLID,
    },
  },
});
export default VoteType;
