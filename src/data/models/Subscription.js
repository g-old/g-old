import knex from '../knex';
import { canSee, canMutate, Models } from '../../core/accessControl';
import Proposal from './Proposal';

export const EventType = {
  NEW_PROPOSAL: 'new_proposal',
  NEW_COMMENT: 'new_comment',
  NEW_DISCUSSION: 'new_discussion',
  NEW_STATEMENT: 'new_statement',
};
export const SubscriptionType = {
  NO: 'no',
  ALL: 'all',
  FOLLOWEES: 'followees',
  REPLIES: 'replies',
  UPDATES: 'updates',
};
export const TargetType = {
  PROPOSAL: 'proposal',
  DISCUSSION: 'discussion',
  GROUP: 'group',
  USER: 'user',
};

class Subscription {
  constructor(data) {
    this.id = data.id;
    this.targetId = data.targetId;
    this.userId = data.userId;
    this.subscriptionType = data.subscription_type;
    this.targetType = data.target_type;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async gen(viewer, id, { subscriptions }) {
    const data = await subscriptions.load(id);
    if (data === null) return null;
    return canSee(viewer, data, Models.SUBSCRIPTION)
      ? new Subscription(data)
      : null;
  }

  static async create(viewer, data, loaders) {
    if (!data) return null;
    if (!canMutate(viewer, data, Models.SUBSCRIPTION)) return null;

    const newData = {
      created_at: new Date(),
      user_id: viewer.id,
    };
    if (data.targetType) {
      let isValid;
      let target;
      switch (data.targetType) {
        case TargetType.PROPOSAL: {
          target = await Proposal.gen(viewer, data.targetId, loaders);
          isValid = target && ['proposed', 'voting'].includes(target.state);
          break;
        }
        case TargetType.GROUP: {
          target = { id: 0 }; // means main "group" - TODO change later
          isValid = true;
          break;
        }

        default:
          isValid = false;
      }
      if (isValid) {
        newData.target_type = data.targetType;
        newData.target_id = target.id;
      }
    }
    let subscriptionType;
    if (data.subscriptionType) {
      subscriptionType = data.subscriptionType; // eslint-disable-line
    } else {
      subscriptionType = SubscriptionType.ALL;
    }
    newData.subscription_type = subscriptionType;

    const subscriptionInDB = await knex.transaction(async trx => {
      const [subscription = null] = await knex('subscriptions')
        .transacting(trx)
        .insert(newData)
        .returning('*');

      return subscription;
    });

    return subscriptionInDB ? new Subscription(subscriptionInDB) : null;
  }

  static async update(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.SUBSCRIPTION)) return null;
    const newData = { updated_at: new Date() };
    const updatedSubscription = await knex.transaction(async trx => {
      const [subscription = null] = await knex('subscriptions')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .update(newData)
        .returning('*');

      return subscription;
    });

    return updatedSubscription ? new Subscription(updatedSubscription) : null;
  }

  static async delete(viewer, data) {
    if (!data || !data.id) return null;
    if (!canMutate(viewer, data, Models.SUBSCRIPTION)) return null;
    const deletedSubscription = await knex.transaction(async trx => {
      await knex('subscriptions')
        .where({ id: data.id })
        .transacting(trx)
        .forUpdate()
        .del();
    });

    return deletedSubscription ? new Subscription(deletedSubscription) : null;
  }
}

export default Subscription;
