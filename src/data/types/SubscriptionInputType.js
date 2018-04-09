import {
  // GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';
import TargetTypeEnum from './TargetTypeEnum';
import SubscriptionTypeEnum from './SubscriptionTypeEnum';

const SubscriptionInputType = new GraphQLInputObjectType({
  name: 'SubscriptionInput',
  fields: {
    id: {
      type: ID,
    },
    targetType: {
      type: TargetTypeEnum,
    },
    subscriptionType: {
      type: SubscriptionTypeEnum,
    },
    targetId: {
      type: ID,
    },
  },
});
export default SubscriptionInputType;
