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
  fields: {
    id: {
      type: new NonNull(ID),
    },
    author: {
      type: UserType,
      resolve: (data, { id }, { viewer, loaders }) => User.gen(viewer, data.author_id, loaders),
    },
    vote: {
      type: VoteType,
      resolve: (data, { id }, { viewer, loaders }) => Vote.gen(viewer, data.voteId, loaders),
    },
    text: {
      type: GraphQLString,
      sqlColumn: 'body',
    },

    likes: {
      type: GraphQLInt,
    },

    pollId: {
      type: ID,
    },

    /* pollInfo: {
      type: new ObjectType({
        name: 'PollInfo',
        fields: {
          id: { type: ID },
          upvotes: { type: GraphQLInt },
          downvotes: { type: GraphQLInt },
          allVoters: { type: GraphQLInt, resolve: data => data.numVoter },
        },
      }),
      resolve: (data, { id }, { viewer, loaders }) => Poll.gen(viewer, data.pollId, loaders),
    },*/

    createdAt: {
      type: GraphQLString,
    },
    updatedAt: {
      type: GraphQLString,
    },
    deletedAt: {
      type: GraphQLString,
    },
  },
});
export default StatementType;
