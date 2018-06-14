import { GraphQLEnumType } from 'graphql';

const MessageTypeEnum = new GraphQLEnumType({
  name: 'MessageTypeEnum',
  values: {
    MEETING: {
      value: 'meeting',
    },
    NOTE: {
      value: 'note',
    },
    COMMUNICATION: {
      value: 'communication',
    },
  },
});

export default MessageTypeEnum;
