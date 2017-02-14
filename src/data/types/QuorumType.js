import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLInt,
} from 'graphql';
import AuthorType from './AuthorType';

const QuorumType = new ObjectType({
  name: 'Quorum',
  sqlTable: 'quorums', // the SQL table for this object type is called "accounts"
  uniqueKey: 'id',
  fields: {
    id: { type: new NonNull(ID) },
    author: {
      type: AuthorType,
    },
    name: {
      type: GraphQLString,
    },
    percentage: {
      type: GraphQLInt,
    },
    voters: {
      type: GraphQLString,
    },

    createdAt: {
      type: GraphQLString,
      sqlColumn: 'created_at',
    },


  },

});
export default QuorumType;
