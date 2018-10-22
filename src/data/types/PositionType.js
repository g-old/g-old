import { GraphQLObjectType as ObjectType, GraphQLInt } from 'graphql';

const PositionType = new ObjectType({
  name: 'PositionType',
  fields: {
    pos: {
      type: GraphQLInt,
    },
    value: {
      type: GraphQLInt,
    },
  },
});

export default PositionType;
