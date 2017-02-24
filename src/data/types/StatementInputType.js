import {
  GraphQLString,
  GraphQLNonNull as NonNull,
  GraphQLInputObjectType,
} from 'graphql';
import VoteInputType from './VoteInputType';


const StatementInputType = new GraphQLInputObjectType({
  name: 'StatementInput',
  description: 'Statement on proposal',
  fields: {

    vote: {
      type: new NonNull(VoteInputType),
    },
    text: {
      type: new NonNull(GraphQLString),
    },
    title: {
      type: new NonNull(GraphQLString),
    },

  },

});
export default StatementInputType;
