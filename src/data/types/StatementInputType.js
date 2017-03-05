import {
  GraphQLString,
  GraphQLNonNull as NonNull,
  GraphQLInputObjectType,
  GraphQLID,
} from 'graphql';
import VoteInputType from './VoteInputType';


const StatementInputType = new GraphQLInputObjectType({
  name: 'StatementInput',
  description: 'Statement on proposal',
  fields: {

    vote: {
      type: VoteInputType,
    },
    text: {
      type: GraphQLString,
    },
    title: {
      type: GraphQLString,
    },

    pollId: {
      type: new NonNull(GraphQLID),
    },

    id: {
      type: GraphQLID,
      description: 'Must be provided for mutations',
    },


  },

});
export default StatementInputType;
