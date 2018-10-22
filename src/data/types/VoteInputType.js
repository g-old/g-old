import {
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';

import PositionInput from './PositionInputType';

const VoteInputType = new GraphQLInputObjectType({
  name: 'VoteInput',

  fields: {
    positions: {
      type: new NonNull(new GraphQLList(PositionInput)),
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
export default VoteInputType;
