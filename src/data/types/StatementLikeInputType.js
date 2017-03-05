import {
  GraphQLNonNull as NonNull,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';


const StatementLikeInputType = new GraphQLInputObjectType({
  name: 'StatementLikeInput',
  fields: {
    statementId: {
      type: new NonNull(ID),
    },
    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },
  },

});
export default StatementLikeInputType;
