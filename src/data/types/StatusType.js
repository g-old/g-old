import { GraphQLEnumType } from 'graphql';

const Status = new GraphQLEnumType({
  name: 'Status',
  values: {
    MEMBER: {
      value: 1,
    },
    NONE: {
      value: 0,
    },
    PENDING: {
      value: 2,
    },
  },
});

export default Status;
