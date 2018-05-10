import { GraphQLNonNull } from 'graphql';
import SubscriptionInput from '../types/SubscriptionInputType';
import SubscriptionType from '../types/SubscriptionType';
import Subscription from '../models/Subscription';

const deleteSubscription = {
  type: new GraphQLNonNull(SubscriptionType),
  args: {
    subscription: {
      type: SubscriptionInput,
      description: 'Delete subscription',
    },
  },
  resolve: async (data, { subscription }, { viewer, loaders }) => {
    const newSubscription = await Subscription.delete(
      viewer,
      subscription,
      loaders,
    );
    return newSubscription;
  },
};

export default deleteSubscription;
