import { GraphQLInputObjectType, GraphQLEnumType, GraphQLID } from 'graphql';

const FilterInputType = new GraphQLInputObjectType({
  name: 'FilterInput',

  fields: {
    filter: {
      type: new GraphQLEnumType({
        name: 'Filter',
        values: {
          REQUESTER_ID: {
            value: 1,
          },
          CONTENT_ID: {
            value: 2,
          },
        },
      }),
    },
    id: {
      type: GraphQLID,
    },
  },
});
export default FilterInputType;
