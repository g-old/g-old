import { GraphQLID } from 'graphql';

import SubscriptionType from '../types/SubscriptionType';
import Subscription from '../models/Subscription';

const subscription = {
  type: SubscriptionType,
  args: {
    id: {
      type: GraphQLID,
    },
  },
  resolve: (parent, { id }, { viewer, loaders }) =>
    Subscription.gen(viewer, id, loaders),
};

export default subscription;
