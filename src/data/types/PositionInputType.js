import { GraphQLInputObjectType, GraphQLInt } from 'graphql';

const PositionInputType = new GraphQLInputObjectType({
  name: 'PositionInput',
  fields: {
    pos: {
      type: GraphQLInt,
    },
    value: {
      type: GraphQLInt,
    },
  },
});
export default PositionInputType;
