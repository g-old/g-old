import { GraphQLObjectType, GraphQLInt, GraphQLList } from 'graphql';
import EdgeType from './EdgeType';
import PageInfoType from './PageInfoType';

const PageType = ItemType =>
  new GraphQLObjectType({
    name: `${ItemType.name}Page`,
    fields: () => ({
      totalCount: { type: GraphQLInt },
      edges: { type: new GraphQLList(EdgeType(ItemType)) },
      pageInfo: { type: PageInfoType },
    }),
  });

export default PageType;
