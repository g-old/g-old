// @flow
import { throwIfMissing } from './utils';
import log from '../logger';
import { sendJob } from './childProcess';

import { SubscriptionType, TargetType } from '../data/models/Subscription';
import Activity, { ActivityType, ActivityVerb } from '../data/models/Activity';
import type { tActivityType } from '../data/models/Activity';
import type { CommentProps } from '../data/models/Comment';
import type { ProposalProps } from '../data/models/Proposal';
import type { DiscussionProps } from '../data/models/Discussion';

// TODO write Dataloaders for batching
let timer;

type ID = string | number;
type Locale = 'it-IT' | 'de-DE' | 'lld-IT';
type NotificationType = 'webpush' | 'email';
type Subscriber = {
  id: ID,
  email: string,
  locale: Locale,
  settings: { [tActivityType]: { [NotificationType]: boolean } },
  subscriptionType?: SubscriptionType,
};
type Selector = [TargetType, ID];
type ActivityMap = { [ID]: Activity };
type SubscriberMap = { [ID]: Subscriber };
type ResourceType = CommentProps | ProposalProps | DiscussionProps;
type ResourceMap = { [ID]: ResourceType };
type RelevantActivities = { subscriber: Subscriber, activities: Activity[] };
type GroupedActivityObjects = { [tActivityType]: { [ID]: {} } };
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
type SubsForActivity = {
  subscriberIds: ID[],
  activity: Activity,
  subscriberByLocale: { [Locale]: ID[] },
};
export type NotificationSet = {
  activities: { [ID]: SubsForActivity },
  subscriberIds: Set<ID>,
  subscriberById: SubscriberMap,
};
type RawNotification = {
  user_id: ID,
  activity_id: ID,
  created_at: Date,
};

type GroupedNotifications = {
  webpushData: NotificationSet,
  emailData: NotificationSet,
  allObjects: { [tActivityType]: ResourceMap },
  notifications: RawNotification[],
};
type pushArgs = { webpush: NotificationSet, email: NotificationSet };
type PushMessage = {
  body: string,
  link: string,
  title: string,
  tag: tActivityType,
};
/* type PushMessageResult = {
  message: PushMessage,
  receiverIds: ID[],
};
type Email = {}; */
type PayloadType = { activity: Activity, subjectId: ?ID };

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

const fillWithData = (
  object: GroupedNotifications,
  transportName: string,
  activity: Activity,
  user: Subscriber,
): void => {
  const store = object[transportName];
  if (store.activities[activity.id]) {
    store.activities[activity.id].subscriberIds.push(user.id);
    if (store.activities.subscriberByLocale[user.locale]) {
      store.activities.subscriberByLocale[user.locale].push(user.id);
    } else {
      store.activities.subscriberByLocale[user.locale] = [user.id];
    }
  } else {
    store.activities[activity.id] = {
      subscriberIds: [user.id],
      activity,
      subscriberByLocale: { [user.locale]: [user.id] },
    };
  }
  store.subscriberIds.add(user.id);
  store.subscriberById[user.id] = user;
};

const generateData = (
  activities: { [ID]: SubsForActivity },
  objects: { [tActivityType]: ResourceMap },
  subscriberById: SubscriberMap,
  makeFn: (
    activity: Activity,
    subscriberIds: ID[],
    activityObject: ResourceType,
    locale: Locale,
    subscriberById: SubscriberMap,
    objects: { [tActivityType]: ResourceMap },
  ) => {},
) => {
  const result = [];
  Object.keys(activities).forEach(activityId => {
    const { activity, subscriberByLocale } = activities[activityId];
    const activityObject = objects[activity.type][activity.objectId];
    Object.keys(subscriberByLocale).forEach(locale => {
      const subscriberIds = subscriberByLocale[locale];
      const data = makeFn(
        activity,
        subscriberIds,
        activityObject,
        locale,
        subscriberById,
        objects,
      );
      result.push(data);
    });
  });
  return result;
};

const resourceByLocale = {
  'de-DE': {
    [ActivityType.PROPOSAL]: 'Neuer Beschluss',
    [ActivityType.DISCUSSION]: 'Neue Diskussion',
    [ActivityType.SURVEY]: 'Neue Umfrage',
    [ActivityType.COMMENT]: 'Neuer Kommentar',
    [ActivityType.STATEMENT]: 'Neues Statement',
    [ActivityType.MESSAGE]: 'Neue Nachricht',
  },
  'it-IT': {
    [ActivityType.PROPOSAL]: 'Nuova proposta',
    [ActivityType.DISCUSSION]: 'Nuova discussione',
    [ActivityType.SURVEY]: 'Nuovo sondaggio',
    [ActivityType.COMMENT]: 'Nuovo commento',
    [ActivityType.STATEMENT]: 'Nuovo statement',
    [ActivityType.MESSAGE]: 'Nuovo messagio',
  },
  'lld-IT': {
    [ActivityType.PROPOSAL]: 'Nuova proposta',
    [ActivityType.DISCUSSION]: 'Nuova discussione',
    [ActivityType.SURVEY]: 'Nuovo sondaggio',
    [ActivityType.COMMENT]: 'Nuovo commento',
    [ActivityType.STATEMENT]: 'Nuovo statement',
    [ActivityType.MESSAGE]: 'Nuovo messagio',
  },
};

const getCommentLink = (comment: CommentProps, groupId: ID): string => {
  const parent = comment.parent_id;
  const child = parent ? comment.id : null;

  return `/workteams/${groupId}/discussions/${
    comment.discussion_id
  }?comment=${parent || comment.id}${child ? `&child=${child}` : ''}`;
};

const getProposalLink = (proposal: ProposalProps): string => {
  if (proposal.poll_two_id && proposal.poll_one_id) {
    return `/proposal/${proposal.id}/${proposal.poll_two_id}`;
  }
  return `/proposal/${proposal.id}/${proposal.poll_two_id ||
    proposal.poll_one_id}`;
};

const generatePushMessages = (
  activity: Activity,
  subscriberIds: ID[],
  activityObject: ResourceType,
  locale: Locale,
  subscriberById: SubscriberMap,
  objects: { [tActivityType]: ResourceMap },
): PushMessage => {
  let title;
  let message;
  let link;
  switch (activity.type) {
    case ActivityType.SURVEY:
      title = resourceByLocale[locale][activity.type];
      message = activityObject.title;
      // problem if notifieing open votation
      link = getProposalLink(activityObject);
      break;
    case ActivityType.DISCUSSION:
      title = resourceByLocale[locale][activity.type];
      // problem if notifieing open votation
      message = activityObject.title;

      link = `/workteams/${activityObject.work_team_id}/discussions/${
        activityObject.id
      }`;
      break;
    case ActivityType.PROPOSAL:
      // get resources
      title = resourceByLocale[locale][activity.type];

      message = activityObject.title;

      link = getProposalLink(activityObject);
      // recipients are data-activities
      break;

    case ActivityType.STATEMENT: {
      const proposal = objects[ActivityType.PROPOSAL][activity.targetId];
      message = proposal.title;
      // Diff between reply and new ?

      title = resourceByLocale[locale][activity.type];
      //
      link = `/proposal/${proposal.id}/${activityObject.poll_id}`;
      break;
    }

    case ActivityType.COMMENT: {
      const discussion = objects[ActivityType.COMMENT][activity.targetId];
      message = discussion.title;
      // Diff between reply and new ?

      title = resourceByLocale[locale][activity.type];
      link = getCommentLink(activityObject, discussion.work_team_id);
      break;
    }

    case ActivityType.MESSAGE:
      title = resourceByLocale[locale][activity.type];
      link = `/message/${activity.objectId}`;
      message = activityObject.title;
      break;
    default:
      throw new Error(`Type not recognized ${activity.type}`);
  }
  // TODO

  /* const activitySubscribers = subscriberByLocale[locale].map(id => {
    const res = subscriptionData.find(
      // eslint-disable-next-line eqeqeq
      subscription => subscription.user_id == id,
    );

    return res;
  }); */

  return {
    body: message.length > 40 ? `${message.slice(0, 36)}...` : message,
    link,
    title,
    tag: activity.type,
  };
};

class NotificationService {
  EventManager: {};
  activityQueue: Activity[];
  delimiter: string;
  maxBatchSize: number;
  batchingWindow: number;
  dbConnector: any;
  MailComposer: any;
  filterActivity: (payload: PayloadType) => void;
  batchProcessing: () => void;
  processQueue: () => void;
  constructor({
    eventManager = throwIfMissing('EventManager'),
    dbConnector = throwIfMissing('Database connection'),
    mailComposer = throwIfMissing('MailComposer'),
    // sseEmitter = throwIfMissing('SSE-Emitter'),
    maxBatchSize,
    batchingWindow,
  }) {
    this.EventManager = eventManager;
    this.dbConnector = dbConnector;
    this.MailComposer = mailComposer;
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
  filterActivity(payload: PayloadType): void {
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
    [tActivityType]: Set<ID>,
  }): Promise<GroupedActivityObjects> {
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
          allObjects,
        } = await this.getAndGroupNotifications(notificationData);

        // console.log(' NEW GROUPED NOTIFICATIONS', { webpushData, emailData });

        const emails = generateData(
          emailData.activities,
          allObjects,
          emailData.subscriberById,
          this.generateEmail,
        );

        const pushMessages = generateData(
          webpushData.activities,
          allObjects,
          webpushData.subscriberById,
          generatePushMessages,
        );

        const notificationIds = await this.dbConnector
          .batchInsert('notifications', notifications, this.maxBatchSize)
          .returning('id');
        // TODO add notificationIds
        console.info(notificationIds);

        // generate pushData

        // generateEmailData

        /* await this.dbConnector('users')
          .whereIn('id', [
            ...webpushData.subscriberIds.values(),
            ...emailData.subscriberIds.values(),
          ])
          .pluck('locale');
*/
        // TODO Add locale
        await this.notifyPushServices({
          webpush: { pushMessages },
          email: { emails },
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

  generateEmail(
    activity: Activity,
    subscriberIds: ID[],
    activityObject: ResourceType,
    locale: Locale,
    subscriberById: SubscriberMap,
    objects: { [tActivityType]: ResourceMap },
  ) {
    let receiver;
    if (subscriberIds) {
      receiver = subscriberIds.map(sId => subscriberById[sId].email);
    }
    switch (activity.type) {
      case ActivityType.DISCUSSION:
      case ActivityType.SURVEY:
      case ActivityType.PROPOSAL: {
        const link = `/proposal/${
          activityObject.id
        }/${activityObject.poll_two_id || activityObject.poll_one_id}`;
        const message = this.MailComposer.getProposalNotificationMail({
          receiver,
          message: {
            content: activityObject.body || activityObject.content,
          },
          sender: { name: 'gold' },
          title: activityObject.title,
          locale,
          link,
        });

        return { message, receiver };
      }
      // return acc;
      //  }, {});

      case ActivityType.STATEMENT: {
        const proposal = objects[ActivityType.PROPOSAL][activity.targetId];
        const link = `/proposal/${proposal.id}/${activityObject.poll_id}`;
        const message = this.MailComposer.getProposalNotificationMail({
          receiver,
          message: {
            content: activityObject.text || activityObject.content,
          },
          sender: { name: 'gold' },
          locale,
          link,
        });
        return { message, receiver };
      }
      case ActivityType.COMMENT: {
        const discussion = objects[ActivityType.DISCUSSION][activity.targetId];
        const link = getCommentLink(activityObject, discussion.work_team_id);
        const message = this.MailComposer.getProposalNotificationMail({
          receiver,
          message: {
            content: activityObject.content,
          },
          sender: { name: 'gold' },
          locale,
          link,
        });
        return { message, receiver };
      }
      case ActivityType.MESSAGE: {
        const link = `/message/${activity.objectId}`;

        const message = this.MailComposer.getProposalNotificationMail({
          receiver,
          message: {
            content: activityObject.msg,
          },
          sender: { name: 'gold' },
          locale,
          link,
        });
        return { message, receiver };
      }

      default:
        throw new Error(`ActivityType not recognized : ${activity.type}`);
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

  async getAllActivityObjects(
    emailData: NotificationSet,
    webpushData: NotificationSet,
  ): Promise<GroupedActivityObjects> {
    const allActivities: SubsForActivity[] = Object.keys(emailData.activities)
      .map(id => emailData.activities[id])
      .concat(
        Object.keys(webpushData.activities).map(
          id => webpushData.activities[id],
        ),
      );

    const groupedByType: {
      [tActivityType]: Set<ID>,
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

    return this.loadObjects(groupedByType);
  }

  // eslint-disable-next-line class-methods-use-this
  async getAndGroupNotifications(
    notificationData: RelevantActivities[],
  ): Promise<GroupedNotifications> {
    const now = new Date();
    const resultSet = {
      emailData: {
        activities: {},
        subscriberIds: new Set(),
        subscriberById: {},
        subscriberByLocale: {},
        allObjects: {},
      },
      webpushData: {
        activities: {},
        subscriberIds: new Set(),
        subscriberById: {},
        subscriberByLocale: {},
        allObjects: {},
      },
      notifications: [],
    };

    const result = notificationData.reduce(
      (acc: GroupedNotifications, data) => {
        if (data.subscriber && data.activities) {
          const user = data.subscriber;
          data.activities.forEach(activity => {
            acc.notifications.push({
              user_id: user.id,
              activity_id: activity.id,
              created_at: now,
            });
            const { settings } = user;
            if (settings[activity.type]) {
              // TODO normalize activities with Map aId: a, aId: [userIds]

              if (settings[activity.type].email) {
                if (acc.emailData.activities[activity.id]) {
                  fillWithData(acc, 'emailData', activity, user);
                  /*  acc.emailData.activities[activity.id].subscriberIds.push(
                  user.id,
                );
                if (acc.emailData.activities.subByLocale[user.locale]) {
                  acc.emailData.activities.subByLocale[user.locale].push(
                    user.id,
                  );
                } else {
                  acc.emailData.activities.subByLocale[user.locale] = [user.id];
                }
              } else {
                acc.emailData.activities[activity.id] = {
                  subscriberIds: [user.id],
                  activity: activity,
                  subByLocale: { [user.locale]: [user.id] },
                };
              }
              acc.emailData.subscriberIds.add(user.id);
              acc.emailData.subscriberById[user.id] = user; */

                  // acc.email.push({ userId: data.subscriber.userId, activity: a });
                }
                // allow both notification methods combined
                if (data.subscriber.settings[activity.type].webpush) {
                  fillWithData(acc, 'webpushData', activity, user);

                  /*
              if (acc.webpushData.activities[activity.id]) {
                acc.webpushData.activities[activity.id].subscriberIds.push(
                  data.subscriber.id,
                );
              } else {
                acc.webpushData.activities[activity.id] = {
                  subscriberIds: [data.subscriber.id],
                  activity: activity,
                };
              }
              acc.webpushData.subscriberIds.add(data.subscriber.id);
              acc.webpushData.subscriberById[data.subscriber.id] =
                data.subscriber; */
                }
              }
            }
          });
        }
        return acc;
      },
      resultSet,
    );

    // group by locale
    /* Object.keys(result.webpushData.activities).forEach(data => {});

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
    }); */

    // load all objects for webpush/email

    // load locales

    const allObjects = await this.getAllActivityObjects(
      result.emailData,
      result.webpushData,
    );

    // split allobjects ? or make final data here and send only results?
    result.allActivities = allObjects;
    return result;
  }
}

export default NotificationService;
