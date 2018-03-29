import { GraphQLEnumType } from 'graphql';

const PostVerb = new GraphQLEnumType({
  name: 'PostVerb',
  values: {
    CREATED: {
      value: 0,
    },
    CLOSED: {
      value: 1,
    },
    REJECTED: {
      value: 2,
    },
    REVOKED: {
      value: 3,
    },
    VOTING: {
      value: 4,
    },
  },
});

export default PostVerb;
