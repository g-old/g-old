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
    REPORT: {
      value: 'report',
    },
  },
});

export default MessageTypeEnum;
