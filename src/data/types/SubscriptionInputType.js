import {
  // GraphQLString as String,
  GraphQLInputObjectType,
  GraphQLID as ID,
} from 'graphql';
import EventTypeEnum from './EventTypeEnum';
import SubscriptionTypeEnum from './SubscriptionTypeEnum';

const SubscriptionInputType = new GraphQLInputObjectType({
  name: 'SubscriptionInput',
  fields: {
    id: {
      type: ID,
    },
    eventType: {
      type: EventTypeEnum,
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
