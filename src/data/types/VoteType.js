import {
  GraphQLString,
  GraphQLObjectType as ObjectType,
  GraphQLInt,
} from 'graphql';


const VoteType = new ObjectType({
  name: 'Vote',
  sqlTable: 'votes', // 'votes', if here join monster will try a join and fail
  uniqueKey: 'id',

  fields: {

    id: {
      type: GraphQLInt,
    },

    position: {
      type: GraphQLString,
    //  resolve: (data) => data.position,
    },
    voter: {
      type: GraphQLInt,
      // resolve: (data) => data.user_id,
      sqlColumn: 'user_id',
    },
    poll: {
      type: GraphQLInt,
      sqlColumn: 'poll_id',
    //  resolve: (data) => data.proposal_id,
    },

  },

});
export default VoteType;
