import { throwIfMissing } from './utils';
import log from '../logger';

import { SubscriptionType, TargetType } from '../data/models/Subscription';
import { ActivityType } from '../data/models/Activity';
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
    let type;
    let targetId;
    switch (activity.type) {
      case ActivityType.STATEMENT:
        type = TargetType.PROPOSAL;
        targetId = activity.subjectId || subjectId;
        break;

      case ActivityType.DISCUSSION:
      case ActivityType.SURVEY: // not used yet
      case ActivityType.PROPOSAL:
        type = TargetType.GROUP;
        targetId = activity.groupId ? activity.groupId : 0;
        break;

      case ActivityType.COMMENT:
        type = TargetType.DISCUSSION;
        targetId = activity.subjectId || subjectId;
        break;

      case ActivityType.MESSAGE:
        type = TargetType.USER;
        targetId = activity.subjectId || subjectId;
        break;
      default:
        return;
    }
    // or store compound key?
    activity.targetType = type; // eslint-disable-line
    activity.targetId = targetId; // eslint-disable-line
    // console.log('ACTIVITY', { activity, subjectId });
    if ('targetId' in activity) {
      this.activityQueue.push(activity);
    }
  }
  groupByTargetAndEventType(activities) {
    return activities.reduce((agg, activity) => {
      const compoundKey =
        activity.targetType + this.delimiter + activity.targetId;
      if (agg[compoundKey]) {
        agg[compoundKey].activities.push(activity);
      } else {
        // eslint-disable-next-line no-param-reassign
        agg[compoundKey] = {
          activities: [activity],
          targetType: activity.targetType,
          targetId: activity.targetId,
        };
      }
      return agg;
    }, {});
  }

  async findSubscribers(groupedActivities) {
    const promises = Object.keys(groupedActivities).map(async key => {
      const subscribers = await this.loadSubscriptions([
        groupedActivities[key].targetType,
        groupedActivities[key].targetId,
      ]);
      // eslint-disable-next-line no-param-reassign
      groupedActivities[key].subscribers = subscribers;
    });
    await Promise.all(promises);
    return groupedActivities;
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
    switch (selector[0]) {
      case TargetType.GROUP:
        // eslint-disable-next-line
        if (selector[1] == 0) {
          // means no group
          // PROPBLEM : ALSO GUESTS GET NOTIFIED!! -if they have notificationsettings
          return this.dbConnector('notification_settings').select(
            'notification_settings.user_id as userId',
            'notification_settings.settings as settings',
          );
        }
        // workteams
        return this.dbConnector('user_work_teams')
          .where({ group_id: selector[1] })
          .innerJoin(
            'notification_settings',
            'notification_settings.user_id',
            'user_work_teams.user_id',
          )
          .select(
            'notification_settings.user_id as userId',
            'notification_settings.settings as settings',
          );
      case TargetType.USER: // messages
        return this.dbConnector('notification_settings')
          .where({ user_id: selector[1] })
          .select(
            'notification_settings.user_id as userId',
            'notification_settings.settings as settings',
          );
      case TargetType.PROPOSAL:
      case TargetType.DISCUSSION: {
        return this.dbConnector('subscriptions')
          .where({
            target_type: selector[0],
            target_id: selector[1],
          })
          .innerJoin(
            'notification_settings',
            'notification_settings.user_id',
            'subscriptions.user_id',
          )
          .select(
            'notification_settings.user_id as userId',
            'notification_settings.settings as settings',
            'subscriptions.subscription_type as subscriptionType',
            'subscriptions.target_type as targetType',
            'subscriptions.target_id as targetId',
          );
      }
      default:
        throw new Error(`TargetType not recognized: ${selector[0]}`);
    }
  }

  async batchProcessing() {
    // const startTime = process.hrtime();
    // console.log('BATCH -activities', this.activityQueue);
    try {
      const activities = this.activityQueue.splice(
        0,
        this.activityQueue.length,
      );
      if (activities.length) {
        const groupedActivities = this.groupByTargetAndEventType(activities);
        const activitiesAndSubscribers = await this.findSubscribers(
          groupedActivities,
        );

        const notificationData = await this.combineData(
          activitiesAndSubscribers,
        );

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

      // TODO
      // SSE all new notifications to active users - only count of new notifications
    } catch (err) {
      log.error({ err }, err.message);
    }
  }

  async combineData(groupedActivities) {
    const proms = Object.keys(groupedActivities).map(compoundKey => {
      const data = groupedActivities[compoundKey];
      const promises = data.subscribers.map(subscriber =>
        this.mergeNotifyableActivitiesWithSubscribers(
          subscriber,
          data.activities,
        ),
      );
      return Promise.all(promises);
    });
    const data = await Promise.all(proms);
    return data.reduce((acc, curr) => acc.concat(curr), []);
  }

  async mergeNotifyableActivitiesWithSubscribers(subscriber, activities) {
    if (
      !subscriber.subscriptionType ||
      subscriber.subscriptionType === SubscriptionType.ALL
    ) {
      return {
        subscriber,
        activities,
      };
    }
    switch (subscriber.subscriptionType) {
      case SubscriptionType.FOLLOWEES: {
        if (activities.length) {
          // filter proposals and discussions aut
          const followeeActivities = activities.filter(
            activity =>
              activity.type !== ActivityType.PROPOSAL &&
              activity.type !== ActivityType.DISCUSSION,
          );
          const followerActivities = await this.checkIfFollowing(
            subscriber,
            followeeActivities,
          );
          return { subscriber, activities: followerActivities };
        }
        return {};
      }
      case SubscriptionType.REPLIES: {
        if (activities.length) {
          // for each one which has a parent id get parent comments author...
          const relevantIds = activities.map(a => a.objectId);
          // TODO  with Dataloader
          const replyIds = await this.dbConnector('comments')
            .whereNotNull('parent_id')
            .whereIn('id', [relevantIds])
            .where({ author_id: subscriber.id })
            .pluck('id');
          return {
            subscriber,
            activities: replyIds.map(
              rId => activities.find(a => a.objectId == rId), // eslint-disable-line
            ),
          };
        }
        return {};
      }
      case SubscriptionType.UPDATES: {
        return {
          subscriber,
          activities: activities.filter(
            a =>
              a.verb === 'update' &&
              [
                ActivityType.PROPOSAL,
                ActivityType.DISCUSSION,
                ActivityType.SURVEY,
              ].includes(a.type),
          ),
        };
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
      .pluck('followee_id');
    const followeeSet = new Set(followees);
    return activities.filter(activity =>
      followeeSet.has(Number(activity.actorId)),
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
            if (data.subscriber.settings[a.type]) {
              // TODO normalize activities with Map aId: a, aId: [userIds]
              if (data.subscriber.settings[a.type].email) {
                acc.email.push({ userId: data.subscriber.userId, activity: a });
              } else if (data.subscriber.settings[a.type].webpush) {
                acc.webpush.push({
                  userId: data.subscriber.userId,
                  activity: a,
                });
              }
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
