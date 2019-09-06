import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
} from 'graphql';
import GraphQLDate from './GraphQLDateType';

const AuthorType = new ObjectType({
  name: 'Author',
  sqlTable: 'users', // the SQL table for this object type is called "accounts"
  uniqueKey: 'id',
  fields: {
    id: {
      type: new NonNull(ID),
    },
    name: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    createdAt: {
      type: GraphQLDate,
      sqlColumn: 'created_at',
    },
  },
});
export default AuthorType;
