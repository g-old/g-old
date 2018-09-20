import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
} from 'graphql';
import VoteType from './VoteDLType';
import User from '../models/User';
import Vote from '../models/Vote';
import UserType from './UserType';
// import Poll from '../models/Poll';

const StatementType = new ObjectType({
  name: 'StatementDL',
  description: 'Statement on proposal',
  fields: () => ({
    id: {
      type: new NonNull(ID),
    },
    author: {
      type: UserType,
      resolve: (data, args, { viewer, loaders }) =>
        User.gen(viewer, data.author_id, loaders),
    },
    vote: {
      type: VoteType,
      resolve: (data, args, { viewer, loaders }) =>
        Vote.gen(viewer, data.voteId, loaders),
    },

    /* position: {
      type: GraphQLString,
    }, */
    text: {
      type: GraphQLString,
    },

    likes: {
      type: GraphQLInt,
    },

    pollId: {
      type: ID,
    },

    createdAt: {
      type: GraphQLString,
    },
    updatedAt: {
      type: GraphQLString,
    },
    deletedAt: {
      type: GraphQLString,
    },
  }),
});
export default StatementType;
