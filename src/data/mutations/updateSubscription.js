import { GraphQLNonNull } from 'graphql';
import SubscriptionInput from '../types/SubscriptionInputType';
import SubscriptionType from '../types/SubscriptionType';
import Subscription from '../models/Subscription';

const updateSubscription = {
  type: new GraphQLNonNull(SubscriptionType),
  args: {
    subscription: {
      type: SubscriptionInput,
      description: 'Update subscription',
    },
  },
  resolve: async (data, { subscription }, { viewer, loaders }) => {
    const newSubscription = await Subscription.update(
      viewer,
      subscription,
      loaders,
    );
    return newSubscription;
  },
};

export default updateSubscription;
