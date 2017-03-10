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
      resolve: (data) => { console.log(data); return data.position; },
    },
    voter: {
      type: UserType,
      // resolve: (data) => data.user_id,
      resolve: (parent, { id }, { viewer, loaders }) => { console.log('VOTETYPE:USER'); console.log(parent); return User.gen(viewer, parent.userId, loaders); },
    },
    pollId: {
      type: GraphQLInt,
    },

  },

});
export default VoteType;
