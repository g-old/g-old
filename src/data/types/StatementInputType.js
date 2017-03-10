import {
  GraphQLString as String,
  GraphQLNonNull as NonNull,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';
import VoteInputType from './VoteInputType';


const StatementInputType = new GraphQLInputObjectType({
  name: 'StatementInput',
  fields: {

    vote: {
      type: VoteInputType,
    },
    text: {
      type: String,
    },
    title: {
      type: String,
    },

    pollId: {
      type: new NonNull(ID),
    },

    id: {
      type: ID,
      description: 'Must be provided for mutations',
    },


  },

});
export default StatementInputType;
