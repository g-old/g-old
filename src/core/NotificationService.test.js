// @flow
/* eslint-env jest */

import NotificationService from './NotificationService';
import { SubscriptionType } from '../data/models/Subscription';
import { TargetType } from '../data/models/utils';

import { getUniqueId } from '../../test/utils';
import { ActivityType } from '../data/models/Activity';

const mockEventManager = () => ({
  subscribe: () => {},
  publish: () => {},
});

const mockDbConnector = getFn => ({
  batchInsert: (_, data) => {
    getFn(data);
  },
});

const mockComposer = () => ({});
const mockPubSub = () => ({});

const setupService = getFn => {
  const service = new NotificationService({
    dbConnector: mockDbConnector(getFn),
    eventManager: mockEventManager(),
    mailComposer: mockComposer(),
    pubsub: mockPubSub(),
  });
  service.processQueue = () => {};

  return service;
};

const NSettings = {
  GROUP: 1,
};

const generateWithSettings = (settings = {}) => ({
  userId: getUniqueId(),
  ...settings,
});

const generateSNotificationSettings = (type, subscription, settings) => {
  switch (type) {
    case NSettings.GROUP:
      return generateWithSettings(settings);

    default:
      throw new Error(`Type not recognized: ${type}`);
  }
};

const genSubCombination = settings => [
  generateSNotificationSettings(NSettings.GROUP, settings, {
    email: true,
  }),
  generateSNotificationSettings(NSettings.GROUP, settings, {
    webpush: true,
  }),
  generateSNotificationSettings(NSettings.GROUP, settings, {
    email: true,
    webpush: true,
  }),
  generateSNotificationSettings(NSettings.GROUP, settings, {}),
];

const setupSubscriptions = () => selector => {
  switch (selector[0]) {
    case TargetType.GROUP:
      if (selector[1] === 0) {
        // means no group
        // PROPBLEM : ALSO GUESTS GET NOTIFIED!! -if they have notificationsettings
        return Promise.resolve(genSubCombination());
      }
      throw new Error('To implement');

    /*  case TargetType.USER: // messages
       return this.dbConnector('notification_settings')
          .where({ user_id: selector[1] })
          .select(
            'notification_settings.user_id as userId',
            'notification_settings.settings as settings',
          );
      break;
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
      break;
    } */
    default:
      throw new Error(`TargetType not recognized: ${selector[0]}`);
  }
};

describe('NotificationService', () => {
  //

  test('Batchprocessing', async () => {
    let store = {};
    const getter = data => (store = data); // eslint-disable-line
    const service = setupService(getter);
    const activities = [
      { id: 1, targetType: TargetType.GROUP, targetId: 0 },
      { id: 2, targetType: TargetType.GROUP, targetId: 0 },
      { id: 3, targetType: TargetType.GROUP, targetId: 0 },
    ];
    service.loadSubscriptions = setupSubscriptions({});
    service.activityQueue = [...activities];
    await service.batchProcessing();

    expect(store.length).toBe(12);
    const WT_ID = 1;
    service.loadSubscriptions = setupSubscriptions({ wt: WT_ID });
    service.activityQueue = [
      { id: 1, targetType: TargetType.GROUP, targetId: 0 },
      { id: 1, targetType: TargetType.GROUP, targetId: WT_ID },
    ];
    await service.batchProcessing();
    expect(store.length).toBe(8);
  });

  test.only('Filter by SubscriptionType', async () => {
    const service = setupService();

    const subscriber = generateWithSettings({
      subscriptionType: SubscriptionType.UPDATES,
    });
    const activityMap = {
      1: { type: ActivityType.PROPOSAL, verb: 'update' },
      2: { type: ActivityType.PROPOSAL, verb: 'create' },
      3: { type: ActivityType.PROPOSAL, verb: 'update' },
      4: { type: ActivityType.STATEMENT, verb: 'update', authorId: 1 },
      5: { type: ActivityType.STATEMENT, verb: 'create', authorId: 2 },
      6: { type: ActivityType.PROPOSAL, verb: 'create', authorId: 1 },
    };

    const updateActivities = await service.mergeNotifyableActivitiesWithSubscribers(
      subscriber,
      [1, 2, 3],
      activityMap,
    );

    expect(updateActivities.activities.length).toBe(2);

    const onlyFollowers = generateWithSettings({
      subscriptionType: SubscriptionType.FOLLOWEES,
      settings: { proposal: { webpush: true } },
    });
    service.checkIfFollowing = (_, activities) =>
      Promise.resolve(activities.filter(a => a.authorId === 1));

    const followerActivities = await service.mergeNotifyableActivitiesWithSubscribers(
      onlyFollowers,
      [1, 4, 5, 6],
      activityMap,
    );

    expect(followerActivities.activities.length).toBe(2);
  });

  test('Get notifications for email and webpush', async () => {
    const service = setupService();

    const notificationData = [
      {
        subscriber: generateWithSettings({
          subscriptionType: SubscriptionType.UPDATES,
          settings: { proposal: { email: true }, statement: { webpush: true } },
        }),
        activities: [
          { type: ActivityType.PROPOSAL, verb: 'update' },
          { type: ActivityType.PROPOSAL, verb: 'create' },
          { type: ActivityType.STATEMENT, verb: 'create' },
        ],
      },
    ];

    const result = service.getAndGroupNotifications(notificationData);
    expect(result.email.length).toBe(2);
    expect(result.webpush.length).toBe(1);
  });
});
