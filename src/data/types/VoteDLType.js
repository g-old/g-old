import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLInt,
} from 'graphql';
import User from '../models/User';
import UserType from './UserType';

const VoteType = new ObjectType({
  name: 'VoteDL',

  fields: {

    id: {
      type: GraphQLInt,
    },

    position: {
      type: GraphQLString,
    //  resolve: (data) => data.position,
    },
    voter: {
      type: UserType,
      // resolve: (data) => data.user_id,
      resolve: (parent, { id }, { viewer, loaders }) => User.gen(viewer, parent.userId, loaders),
    },
    pollId: {
      type: GraphQLInt,
    },

  },

});
export default VoteType;
