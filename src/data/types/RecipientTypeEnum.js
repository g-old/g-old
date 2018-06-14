import { GraphQLEnumType } from 'graphql';

const RecipientType = new GraphQLEnumType({
  name: 'RecipientTypeEnum',
  values: {
    USER: {
      value: 'user',
    },
    GROUP: {
      value: 'group',
    },
    ALL: {
      value: 'all',
    },
  },
});

export default RecipientType;
