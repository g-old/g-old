// @flow
import { throwIfMissing } from './utils';
import log from '../logger';
import { sendJob } from './childProcess';

import { SubscriptionType, TargetType } from '../data/models/Subscription';
import Activity, { ActivityType, ActivityVerb } from '../data/models/Activity';
// TODO write Dataloaders for batching
let timer;

type ID = string | number;
type Locale = 'it-IT' | 'de-DE' | 'lld-IT';
type NotificationType = 'webpush' | 'email';
type Subscriber = {
  id: ID,
  email: string,
  locale: Locale,
  settings: { [typeof ActivityType]: { [NotificationType]: boolean } },
  subscriptionType?: SubscriptionType,
};
type Selector = [TargetType, ID];
type ActivityMap = { [ID]: Activity };
type SubscriberMap = { [ID]: Subscriber };
type ResourceType = {};
type ResourceMap = { [ID]: ResourceType };
type RelevantActivities = { subscriber: Subscriber, activities: Activity[] };
type GroupedActivities = {
  bySubject: {
    [string]: {
      activityIds: ID[],
      targetId: ID,
      targetType: TargetType,
      subscribers: Subscriber[],
    },
  },
  byId: ActivityMap,
};
type SubsForActivity = { subscriberIds: ID[], activity: Activity };
export type NotificationSet = {
  activities: { [ID]: SubsForActivity },
  subscriberIds: Set<ID>,
  subscriberById: SubscriberMap,
  subscriberByLocale: { [Locale]: ID[] },
  allObjects?: ResourceMap,
};
type RawNotification = {
  user_id: ID,
  activity_id: ID,
  created_at: Date,
};

type GroupedNotifications = {
  webpushData: NotificationSet,
  emailData: NotificationSet,
  notifications: RawNotification[],
};
type pushArgs = { webpush: NotificationSet, email: NotificationSet };

const filterReplies = (parents, activities) => {
  const result = [];
  parents.forEach(p => {
    activities.forEach(a => {
      // eslint-disable-next-line
      if (a.content.parentId == p.id) {
        result.push(a);
      }
    });
  });
  return result;
};

const mapTypeToTable = {
  [ActivityType.PROPOSAL]: 'proposals',
  [ActivityType.DISCUSSION]: 'discussions',
  [ActivityType.SURVEY]: 'proposals',
  [ActivityType.STATEMENT]: 'statements',
  [ActivityType.COMMENT]: 'comments',
  [ActivityType.MESSAGE]: 'messages',
};

class NotificationService {
  EventManager: {};
  activityQueue: Activity[];
  delimiter: string;
  maxBatchSize: number;
  batchingWindow: number;
  constructor({
    eventManager = throwIfMissing('EventManager'),
    dbConnector = throwIfMissing('Database connection'),
    // sseEmitter = throwIfMissing('SSE-Emitter'),
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
  filterActivity(payload: { activity: Activity, subjectId: ?ID }) {
    let data;
    const { activity, subjectId } = payload;
    switch (activity.type) {
      case ActivityType.STATEMENT:
        if (activity.verb === ActivityVerb.CREATE) {
          activity.targetType = TargetType.PROPOSAL;
          activity.targetId = activity.subjectId || subjectId;
          data = activity;
        }
        break;

      case ActivityType.DISCUSSION:
      case ActivityType.SURVEY: // not used yet
      case ActivityType.PROPOSAL:
        activity.targetType = TargetType.GROUP;
        activity.targetId = activity.groupId ? activity.groupId : 0;
        data = activity;
        break;

      case ActivityType.COMMENT:
        if (activity.verb === ActivityVerb.CREATE) {
          activity.targetType = TargetType.DISCUSSION;
          activity.targetId = activity.subjectId || subjectId;
          data = activity;
        }
        break;

      case ActivityType.MESSAGE:
        activity.targetType = activity.content.targetType;
        activity.targetId = activity.subjectId || activity.content.targetId;
        data = activity;
        break;
      default:
        return;
    }
    // or store compound key?

    // console.log('ACTIVITY', { activity, subjectId });
    if (data) {
      this.activityQueue.push(data);
    }
  }

  groupBySubject(activities: Activity[]): GroupedActivities {
    return activities.reduce(
      (acc, activity) => {
        const compoundKey =
          activity.targetType + this.delimiter + activity.targetId;
        if (acc.bySubject[compoundKey]) {
          acc.bySubject[compoundKey].activityIds.push(activity.id);
        } else {
          // eslint-disable-next-line no-param-reassign
          acc.bySubject[compoundKey] = {
            activityIds: [activity.id],
            targetType: activity.targetType,
            targetId: activity.targetId,
          };
        }
        if (!acc.byId[activity.id]) {
          acc.byId[activity.id] = activity;
        }
        return acc;
      },
      { bySubject: {}, byId: {} },
    );
  }

  async addSubscribers(
    groupedActivities: GroupedActivities,
  ): Promise<GroupedActivities> {
    const promises = Object.keys(groupedActivities.bySubject).map(async key => {
      const subscribers = await this.loadSubscriptions([
        groupedActivities.bySubject[key].targetType,
        groupedActivities.bySubject[key].targetId,
      ]);
      // eslint-disable-next-line no-param-reassign
      groupedActivities.bySubject[key].subscribers = subscribers;
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

  loadSubscriptions(selector: Selector): Promise<Subscriber[]> {
    switch (selector[0]) {
      case TargetType.GROUP:
        // eslint-disable-next-line
        if (selector[1] == 0) {
          // means no group
          // PROPBLEM : ALSO GUESTS GET NOTIFIED!! -if they have notificationsettings
          return this.dbConnector('notification_settings')
            .innerJoin('users', 'users.id', 'notification_settings.user_id')
            .select(
              'notification_settings.user_id as id',
              'notification_settings.settings as settings',
              'users.locale as locale',
              'users.email as email',
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
          .innerJoin('users', 'users.id', 'notification_settings.user_id')
          .select(
            'notification_settings.user_id as id',
            'notification_settings.settings as settings',
            'users.locale as locale',
            'users.email as email',
          );
      case TargetType.USER: // messages
        return this.dbConnector('notification_settings')
          .where({ user_id: selector[1] })
          .innerJoin('users', 'users.id', 'notification_settings.user_id')
          .select(
            'notification_settings.user_id as id',
            'notification_settings.settings as settings',
            'users.locale as locale',
            'users.email as email',
          );
      case TargetType.PROPOSAL:
      case TargetType.DISCUSSION: {
        return this.dbConnector('subscriptions')
          .where({ target_type: selector[0], target_id: selector[1] })
          .innerJoin(
            'notification_settings',
            'notification_settings.user_id',
            'subscriptions.user_id',
          )
          .innerJoin('users', 'users.id', 'notification_settings.user_id')
          .select(
            'notification_settings.user_id as id',
            'notification_settings.settings as settings',
            'subscriptions.subscription_type as subscriptionType',
            'subscriptions.target_type as targetType',
            'subscriptions.target_id as targetId',
            'users.locale as locale',
            'users.email as email',
          );
      }
      default:
        throw new Error(`TargetType not recognized: ${selector[0]}`);
    }
  }

  async loadObjects(data: {
    [ActivityType]: Set<ID>,
  }): Promise<{ [ActivityType]: { [ID]: {} } }> {
    const allObjects = {};
    const promises = Object.keys(data).map(async type => {
      const objData = await this.dbConnector(mapTypeToTable[type])
        .whereIn('id', [...data[type].values()])
        .select();
      allObjects[type] = objData.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
      }, {});
    });
    await Promise.all(promises);
    //
    return allObjects;
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
        const groupedActivities = this.groupBySubject(activities);
        const activitiesAndSubscribers = await this.addSubscribers(
          groupedActivities,
        );

        const notificationData = await this.combineData(
          activitiesAndSubscribers,
        );
        // const counterData = getNotificationsCounts(notificationData);

        // this.sseEmitter.publish('notifications', counterData);

        const {
          notifications,
          webpushData,
          emailData,
        } = this.getAndGroupNotifications(notificationData);

        const notificationIds = await this.dbConnector
          .batchInsert('notifications', notifications, this.maxBatchSize)
          .returning('id');
        // TODO add notificationIds
        console.info(notificationIds);

        // load all objects for webpush/email
        const allActivities: SubsForActivity[] = Object.keys(
          emailData.activities,
        )
          .map(id => emailData.activities[id])
          .concat(
            Object.keys(webpushData.activities).map(
              id => webpushData.activities[id],
            ),
          );

        const groupedByType: {
          [typeof ActivityType]: Set<ID>,
        } = allActivities.reduce((acc, activityData) => {
          const { activity } = activityData;
          acc[activity.type] = (acc[activity.type] || new Set()).add(
            activity.objectId,
          );
          if (activity.type === ActivityType.STATEMENT) {
            // get subjectId from activity
            // add it to types to load
            if (acc[ActivityType.PROPOSAL]) {
              acc[ActivityType.PROPOSAL].add(activity.targetId);
            } else {
              acc[ActivityType.PROPOSAL] = new Set([activity.targetId]);
            }
          } else if (activity.type === ActivityType.COMMENT) {
            // add it to types to load
            if (acc[ActivityType.DISCUSSION]) {
              acc[ActivityType.DISCUSSION].add(activity.targetId);
            } else {
              acc[ActivityType.DISCUSSION] = new Set([activity.targetId]);
            }
          }

          return acc;
        }, {});

        const objects = await this.loadObjects(groupedByType);
        // load locales
        /* await this.dbConnector('users')
          .whereIn('id', [
            ...webpushData.subscriberIds.values(),
            ...emailData.subscriberIds.values(),
          ])
          .pluck('locale');
*/
        // TODO Add locale
        await this.notifyPushServices({
          webpush: { ...webpushData, allObjects: objects },
          email: { ...emailData, allObjects: objects },
        });
      }

      // const endTime = process.hrtime(startTime);
      // console.log('PROCESSING TIME:', endTime);

      // TODO

      // SSE all new notifications to active users - only count of new notifications
    } catch (err) {
      log.error({ err }, err.message);
    }
  }

  async combineData(
    groupedActivities: GroupedActivities,
  ): Promise<RelevantActivities[]> {
    const proms = Object.keys(groupedActivities.bySubject).map(compoundKey => {
      const data = groupedActivities.bySubject[compoundKey];
      const promises = data.subscribers.map(subscriber =>
        this.mergeNotifyableActivitiesWithSubscribers(
          subscriber,
          data.activityIds,
          groupedActivities.byId,
        ),
      );
      return Promise.all(promises);
    });
    const data = await Promise.all(proms);
    return data.reduce((acc, curr) => acc.concat(curr), []);
  }

  async mergeNotifyableActivitiesWithSubscribers(
    subscriber: Subscriber,
    activityIds: ID[],
    allActivities: ActivityMap,
  ): Promise<RelevantActivities> {
    const activities = activityIds.map(aId => allActivities[aId]);
    if (
      !subscriber.subscriptionType ||
      subscriber.subscriptionType === SubscriptionType.ALL
    ) {
      return {
        subscriber,
        // eslint-disable-next-line
        activities: activities.filter(a => a.actorId != subscriber.id),
      };
    }
    switch (subscriber.subscriptionType) {
      // state updates + followee activitis
      case SubscriptionType.FOLLOWEES: {
        if (activities.length) {
          // filter discussions out
          const followeeActivities = activities.filter(
            activity => activity.type !== ActivityType.DISCUSSION,
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
          const relevantIds = activities
            .filter(
              a =>
                // eslint-disable-next-line eqeqeq
                a.type === ActivityType.COMMENT && a.actorId != subscriber.id,
            )
            .map(a => a.content.parentId);
          // TODO  with Dataloader

          const parents = await this.dbConnector('comments')
            .whereNull('parent_id')
            .whereIn('id', relevantIds)
            .select(['author_id', 'id']);

          const relevantParents = parents.filter(
            // eslint-disable-next-line
            p => p.author_id == subscriber.id,
          );
          return {
            subscriber,
            activities: filterReplies(relevantParents, activities),
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
  // eslint-disable-next-line class-methods-use-this
  async notifyPushServices({ webpush, email }: pushArgs) {
    if (email) {
      const job = {
        type: 'batchMailing',
        data: email,
      };
      await sendJob(job);
    }
    if (webpush) {
      const job = {
        type: 'batchPushing',
        data: webpush,
      };
      await sendJob(job);
    }
  }

  async checkIfFollowing(subscriber: Subscriber, activities: Activity[]) {
    const followees = await this.dbConnector('user_follows')
      .where({ follower_id: subscriber.id })
      .pluck('followee_id');
    const followeeSet = new Set(followees);
    return activities.filter(activity =>
      followeeSet.has(Number(activity.actorId)),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  getAndGroupNotifications(
    notificationData: RelevantActivities[],
  ): GroupedNotifications {
    const now = new Date();
    const resultSet = {
      emailData: {
        activities: {},
        subscriberIds: new Set(),
        subscriberById: {},
        subscriberByLocale: {},
      },
      webpushData: {
        activities: {},
        subscriberIds: new Set(),
        subscriberById: {},
        subscriberByLocale: {},
      },
      notifications: [],
    };

    const result = notificationData.reduce((acc, data) => {
      if (data.subscriber && data.activities) {
        data.activities.forEach(a => {
          acc.notifications.push({
            user_id: data.subscriber.id,
            activity_id: a.id,
            created_at: now,
          });
          if (data.subscriber.settings[a.type]) {
            // TODO normalize activities with Map aId: a, aId: [userIds]

            if (data.subscriber.settings[a.type].email) {
              if (acc.emailData.activities[a.id]) {
                acc.emailData.activities[a.id].subscriberIds.push(
                  data.subscriber.id,
                );
              } else {
                acc.emailData.activities[a.id] = {
                  subscriberIds: [data.subscriber.id],
                  activity: a,
                };
              }
              acc.emailData.subscriberIds.add(data.subscriber.id);
              acc.emailData.subscriberById[data.subscriber.id] =
                data.subscriber;

              // acc.email.push({ userId: data.subscriber.userId, activity: a });
            }
            // allow both notification methods combined
            if (data.subscriber.settings[a.type].webpush) {
              if (acc.webpushData.activities[a.id]) {
                acc.webpushData.activities[a.id].subscriberIds.push(
                  data.subscriber.id,
                );
              } else {
                acc.webpushData.activities[a.id] = {
                  subscriberIds: [data.subscriber.id],
                  activity: a,
                };
              }
              acc.webpushData.subscriberIds.add(data.subscriber.id);
              acc.webpushData.subscriberById[data.subscriber.id] =
                data.subscriber;
            }
          }
        });
      }
      return acc;
    }, resultSet);

    // group by locale

    result.webpushData.subscriberIds.forEach((acc, sId) => {
      const user = result.webpushData.subscriberById[sId];

      if (result.webpushData.subscriberByLocale[user.locale]) {
        result.webpushData.subscriberByLocale[user.locale].push(user.userId);
      } else {
        result.webpushData.subscriberByLocale[user.locale] = [user.userId];
      }
    });

    result.emailData.subscriberIds.forEach((acc, sId) => {
      const user = result.emailData.subscriberById[sId];

      if (result.emailData.subscriberByLocale[user.locale]) {
        result.emailData.subscriberByLocale[user.locale].push(user.userId);
      } else {
        result.emailData.subscriberByLocale[user.locale] = [user.userId];
      }
    });

    return result;
  }
}

export default NotificationService;
