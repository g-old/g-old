import {
  GraphQLObjectType as ObjectType,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';

const StatementLikeType = new ObjectType({
  name: 'StatementLikeType',

  fields: {

    id: {
      type: new GraphQLNonNull(GraphQLID),
    },

    authorId: {
      type: new GraphQLNonNull(GraphQLID),
      // resolve: (data) => data.user_id,
      resolve: (data) => data.userId,
    },
    statementId: {
      type: new GraphQLNonNull(GraphQLID),
    },

  },

});
export default StatementLikeType;
