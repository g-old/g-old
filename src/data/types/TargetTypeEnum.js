import { GraphQLEnumType } from 'graphql';
import { TargetType } from '../models/Subscription';

const TargetTypeEnum = new GraphQLEnumType({
  name: 'TargetTypeEnum',
  values: {
    PROPOSAL: {
      value: TargetType.PROPOSAL,
    },
    DISCUSSION: {
      value: TargetType.DISCUSSION,
    },
    GROUP: {
      value: TargetType.GROUP,
    },
    USER: {
      value: TargetType.USER,
    },
  },
});

export default TargetTypeEnum;
