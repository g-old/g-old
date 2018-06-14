import { GraphQLEnumType } from 'graphql';

const CategoryTypeEnum = new GraphQLEnumType({
  name: 'EventTypeEnum',
  values: {
    CIRCULAR: {
      value: 'circular',
    },
    GROUPS: {
      value: 'groups',
    },
  },
});

export default CategoryTypeEnum;
