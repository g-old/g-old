import {
  GraphQLNonNull as NonNull,
  GraphQLEnumType,
  GraphQLID as ID,
  GraphQLInputObjectType,
} from 'graphql';


const VoteInputType = new GraphQLInputObjectType({
  name: 'VoteInput',


  fields: {

    position: {
      type: new NonNull(new GraphQLEnumType({
        name: 'Position',
        values: {
          PRO: {
            value: 1,
            description: 'You support the proposal',
          },
          CON: {
            value: 0,
            description: 'You are against the proposal',
          },
        },
      })),
    },

    pollId: {
      type: new NonNull(ID),
    },

  },

});
export default VoteInputType;
