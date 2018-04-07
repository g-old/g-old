import { throwIfMissing } from './utils';
import log from '../logger';

import { EventType, SubscriptionType } from '../data/models/Subscription';
// TODO write Dataloaders for batching
let timer;
class NotificationService {
  constructor({
    eventManager = throwIfMissing('EventManager'),
    dbConnector = throwIfMissing('Database connection'),
    maxBatchSize,
    batchingWindow,
  }) {
    this.EventManager = eventManager;
    this.dbConnector = dbConnector;
    this.activityQueue = [];
    this.delimiter = '#';
    this.maxBatchSize = maxBatchSize || 500;
    this.batchingWindow = batchingWindow || 1000 * 10;
    this.filterActivity = this.filterActivity.bind(this);
    this.loadSubscriptions = this.loadSubscriptions.bind(this);
    this.mergeNotifyableActivitiesWithSubscribers = this.mergeNotifyableActivitiesWithSubscribers.bind(
      this,
    );
    this.processQueue = this.processQueue.bind(this);
    this.batchProcessing = this.batchProcessing.bind(this);
    this.registerListener();
    this.processQueue();
  }

  registerListener() {
    this.EventManager.subscribe('onActivityCreated', this.filterActivity);
  }
  filterActivity({ activity, subjectId }) {
    if (['statement', 'proposal'].includes(activity.type)) {
      let type;
      let targetId;
      switch (activity.type) {
        case 'statement':
          type = EventType.NEW_STATEMENT;
          targetId = activity.subjectId || subjectId;
          break;
        case 'proposal':
          type = EventType.NEW_PROPOSAL;
          targetId = activity.groupId;
          break;

        default:
          throw new Error(`Activity type not found: ${activity.type}`);
      }
      // or store compund key?
      activity.eventType = type; // eslint-disable-line
      activity.targetId = targetId; // eslint-disable-line
      if (activity.targetId) {
        this.activityQueue.push(activity);
      }
    }
  }
  groupByTargetAndEventType(activities) {
    return activities.reduce((agg, activity) => {
      const compoundKey =
        activity.eventType + this.delimiter + activity.targetId;
      if (agg[compoundKey]) {
        agg[compoundKey].push(activity);
      } else {
        agg[compoundKey] = [activity]; // eslint-disable-line
      }
      return agg;
    }, {});
  }

  async findSubscribers(groupedActivities) {
    const selectors = Object.keys(groupedActivities).map(keys =>
      keys.split(this.delimiter),
    );

    // TODO Write with where in ... and where in ...
    const promises = selectors.map(this.loadSubscriptions);
    const data = await Promise.all(promises);
    return data.reduce((acc, curr) => acc.concat(curr), []);
  }

  async processQueue() {
    try {
      // await this.batchProcessing();
      if (timer) {
        clearInterval(timer);
        timer = null;
        log.info('Resetting notification timer ');
      } else {
        timer = setInterval(this.batchProcessing, this.batchingWindow);
      }
    } catch (err) {
      log.error({ err }, 'NotificationService failed ');
      await this.processQueue();
    }
  }

  loadSubscriptions(selector) {
    // TODO Write with where in ... and where in ...

    return this.dbConnector('subscriptions')
      .where({ event_type: selector[0], target_id: selector[1] })
      .innerJoin(
        'notification_settings',
        'notification_settings.user_id',
        'subscriptions.user_id',
      )
      .select(
        'notification_settings.user_id as userId',
        'notification_settings.settings as settings',
        'subscriptions.subscription_type as subscriptionType',
        'subscriptions.event_type as eventType',
        'subscriptions.target_id as targetId',
      );
  }

  async batchProcessing() {
    // const startTime = process.hrtime();

    const activities = this.activityQueue.splice(0, this.activityQueue.length);
    if (activities.length) {
      const groupedActivities = this.groupByTargetAndEventType(activities);
      const subscribers = await this.findSubscribers(groupedActivities);

      const notificationData = this.combineData(subscribers, groupedActivities);

      const { notifications, webpush, email } = this.getAndGroupNotifications(
        notificationData,
      );

      await this.dbConnector.batchInsert(
        'notifications',
        notifications,
        this.maxBatchSize,
      );
      this.notifyPushServices({ webpush, email });
    }
    // const endTime = process.hrtime(startTime);
    // console.log('PROCESSING TIME:', endTime);
  }
  combineData(subscribers, groupedActivities) {
    return subscribers.map(subscriber =>
      this.mergeNotifyableActivitiesWithSubscribers(
        subscriber,
        groupedActivities,
      ),
    );
  }

  mergeNotifyableActivitiesWithSubscribers(subscriber, groupedActivities) {
    const compoundKey =
      subscriber.eventType + this.delimiter + subscriber.targetId;
    switch (subscriber.subscriptionType) {
      case SubscriptionType.ALL: {
        return { subscriber, activities: groupedActivities[compoundKey] };
      }
      case SubscriptionType.FOLLOWEES: {
        const activities = groupedActivities[compoundKey];
        if (activities.length) {
          // filter proposals and discussions aut
          const followeeActivities = activities.filter(
            activity =>
              activity.type !== 'proposal' || activity.type !== 'discussion',
          );
          const followerActivities = this.checkIfFollwing(
            subscriber,
            followeeActivities,
          );
          return { subscriber, acivities: followerActivities };
        }
        return {};
      }

      default:
        return {};
    }
  }

  notifyPushServices({ webpush, email }) {
    this.EventManager.publish('readyForPush', webpush);
    this.EventManager.publish('readyForEmail', email);
  }

  async checkIfFollowing(subscriber, activities) {
    const followees = await this.dbConnector('user_follows')
      .where({ follower_id: subscriber.userId })
      .pluck('follower_id');
    const followeeSet = new Set(followees);
    return activities.filter(activity =>
      followeeSet.has(Number(activity.authorId)),
    );
  }
  // eslint-disable-next-line class-methods-use-this
  getAndGroupNotifications(notificationData) {
    const now = new Date();
    return notificationData.reduce(
      (acc, data) => {
        if (data.subscriber && data.activities) {
          data.activities.forEach(a => {
            acc.notifications.push({
              user_id: data.subscriber.userId,
              activity_id: a.id,
              created_at: now,
            });
            if (data.subscriber.settings.email) {
              // TODO normalize activities with Map aId: a, aId: [userIds]
              acc.email.push({ userId: data.subscriber.userId, activity: a });
            } else if (data.subscriber.settings.webpush) {
              acc.webpush.push({ userId: data.subscriber.userId, activity: a });
            }
          });
        }
        return acc;
      },
      { notifications: [], webpush: [], email: [] },
    );
  }
}

export default NotificationService;
