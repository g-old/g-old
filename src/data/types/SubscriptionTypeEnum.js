import { GraphQLEnumType } from 'graphql';
import { SubscriptionType } from '../models/Subscription';

const SubscriptionTypeEnum = new GraphQLEnumType({
  name: 'SubscriptionTypeEnum',
  values: {
    NO: {
      value: SubscriptionType.NO,
    },
    ALL: {
      value: SubscriptionType.ALL,
    },
    FOLLOWEES: {
      value: SubscriptionType.FOLLOWEES,
    },
  },
});

export default SubscriptionTypeEnum;
