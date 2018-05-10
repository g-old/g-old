import { GraphQLObjectType } from 'graphql';
import SubscriptionType from './SubscriptionType';

const WithSubscriptionResultType = ItemType =>
  new GraphQLObjectType({
    name: `${ItemType.name}Result`,
    fields: () => ({
      resource: {
        type: ItemType,
      },
      subscription: {
        type: SubscriptionType,
      },
    }),
  });

export default WithSubscriptionResultType;
