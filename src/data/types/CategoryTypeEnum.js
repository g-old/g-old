import { GraphQLEnumType } from 'graphql';

const CategoryTypeEnum = new GraphQLEnumType({
  name: 'CategoryTypeEnum',
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
