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
    ROLE: {
      value: 'role',
    },
  },
});

export default RecipientType;
