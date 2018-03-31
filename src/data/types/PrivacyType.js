import { GraphQLEnumType } from 'graphql';

const Privacy = new GraphQLEnumType({
  name: 'Privacy',
  values: {
    OPEN: {
      value: 'open',
    },
    CLOSED: {
      value: 'closed',
    },
  },
});

export default Privacy;
