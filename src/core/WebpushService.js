/* eslint-disable */
throw new Error('Not implemented');
import { throwIfMissing } from './utils';
import log from '../logger';

import { SubscriptionType, TargetType } from '../data/models/Subscription';
import { ActivityType } from '../data/models/Activity';

const groupByActivityType = notifications =>
  notifications.reduce((acc, notification) => {
    (acc[notification.activity.type] =
      acc[notification.activity.type] || []).push(notification.userId);
    return acc;
  }, {});

class WebpushService {
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

    this.registerListener();
  }

  registerListener() {
    this.EventManager.subscribe('readyForPush', this.prepareForPush);
  }

  prepareForPush(notifications) {
    const grouped = groupByActivityType(notifications);

    const cccc = this.getData(grouped);
    switch (notifications) {
      case value:
        break;

      default:
        break;
    }
  }

  throttle() {}

  getData(groupedActivities) {
    Object.keys(groupedActivities).map(activityType => {
      switch (activityType) {
        case ActivityType.PROPOSAL:
          {
            // get Proposal
            // get subscriptiondata
          }
          break;

        default:
          break;
      }
    });
  }

  // shoul be worker
  async push(subscriptionData, msg) {
    let result;
    try {
      const subscriptions = subscriptionData.map(s => ({
        endpoint: s.endpoint,
        keys: { auth: s.auth, p256dh: s.p256dh },
      }));

      const messages = subscriptions.map(sub =>
        webPush
          .sendMessage(
            sub,
            JSON.stringify({
              body: msg.body,
              link: msg.link,
              title: msg.title,
              tag: msg.tag,
            }),
          )
          .then(response => {
            log.info({ pushService: response });
            if (response.statusCode !== 201) {
              log.warn({ pushService: response });
            }
          })
          .catch(err => {
            if (err.statusCode === 410) {
              log.error({ pushService: err }, 'Subscription should be deleted');
              return knex('webpush_subscriptions')
                .where({ endpoint: sub.endpoint })
                .del();
            }
            log.error(err, 'Subscription no longer valid');
            return Promise.resolve();
          }),
      );

      result = await Promise.all(messages);
    } catch (e) {
      log.error({ err: e }, 'Message failed');
    }
    return result;
  }
}
export default WebpushService;
