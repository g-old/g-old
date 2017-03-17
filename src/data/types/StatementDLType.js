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


const StatementType = new ObjectType({
  name: 'StatementDL',
  description: 'Statement on proposal',
  sqlTable: 'statements', // the SQL table for this object type is called "accounts"
  uniqueKey: 'id',
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

    createdAt: {
      type: GraphQLString,
    },
    updatedAt: {
      type: GraphQLString,
    },
  },

});
export default StatementType;
