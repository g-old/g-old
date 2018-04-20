import {
  GraphQLString as String,
  GraphQLObjectType,
  GraphQLID as ID,
} from 'graphql';

import UserType from './UserType';
import User from '../models/User';
import TargetType from './TargetTypeEnum';
import SubscriptionTypeEnum from './SubscriptionTypeEnum';

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    id: {
      type: ID,
    },
    user: {
      type: UserType,
      resolve(parent, args, { viewer, loaders }) {
        return User.gen(viewer, parent.userId, loaders);
      },
    },
    subscriptionType: {
      type: SubscriptionTypeEnum,
    },
    targetType: {
      type: TargetType,
    },
    targetId: {
      type: ID,
    },
    /* TODO - group, proposal
    target: {
      type: ObjectType,
    }, */
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
  }),
});

export default SubscriptionType;
