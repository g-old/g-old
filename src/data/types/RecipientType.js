import { GraphQLEnumType } from 'graphql';

const RecipientType = new GraphQLEnumType({
  name: 'RecipientType',
  values: {
    USER: {
      value: 'user',
    },
    GROUP: {
      value: 'group',
    },
  },
});

export default RecipientType;
