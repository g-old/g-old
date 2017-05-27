import { GraphQLString, GraphQLObjectType } from 'graphql';

const EdgeType = ItemType =>
  new GraphQLObjectType({
    name: `${ItemType.name}Edge`,
    fields: () => ({
      node: {
        type: ItemType,
      },
      cursor: {
        type: GraphQLString,
      },
    }),
  });

export default EdgeType;
