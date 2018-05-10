import { GraphQLNonNull } from 'graphql';
import SubscriptionInput from '../types/SubscriptionInputType';
import SubscriptionType from '../types/SubscriptionType';
import Subscription from '../models/Subscription';

const createSubscription = {
  type: new GraphQLNonNull(SubscriptionType),
  args: {
    subscription: {
      type: SubscriptionInput,
      description: 'Create a new subscription',
    },
  },
  resolve: async (data, { subscription }, { viewer, loaders }) => {
    const newSubscription = await Subscription.create(
      viewer,
      subscription,
      loaders,
    );
    return newSubscription;
  },
};

export default createSubscription;
