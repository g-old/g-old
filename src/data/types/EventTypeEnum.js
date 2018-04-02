import { GraphQLEnumType } from 'graphql';
import { EventType } from '../models/Subscription';

const EventTypeEnum = new GraphQLEnumType({
  name: 'SubscriptionType',
  values: {
    NEW_PROPOSAL: {
      value: EventType.NEW_PROPOSAL,
    },
    NEW_DISCUSSION: {
      value: EventType.NEW_DISCUSSION,
    },
    NEW_COMMENT: {
      value: EventType.NEW_COMMENT,
    },
    NEW_STATEMENT: {
      value: EventType.NEW_STATEMENT,
    },
  },
});

export default EventTypeEnum;
