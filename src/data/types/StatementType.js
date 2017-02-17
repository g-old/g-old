import {
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
} from 'graphql';
import AuthorType from './AuthorType';


const StatementType = new ObjectType({
  name: 'Statement',
  description: 'Statement on proposal',
  sqlTable: 'statements', // the SQL table for this object type is called "accounts"
  uniqueKey: 'id',
  fields: {
    id: {
      type: new NonNull(ID),
    },
    author: {
      type: AuthorType,
      sqlJoin(statementsTable, usersTable) {
        return `${statementsTable}.author_id = ${usersTable}.id`;
      },
    },

    text: {
      type: GraphQLString,
      sqlColumn: 'body',
    },
    title: {
      type: GraphQLString,
    },
    likes: {
      type: GraphQLInt,
    },
    createdAt: {
      type: GraphQLString,
      sqlColumn: 'created_at',
    },
  },

});
export default StatementType;
