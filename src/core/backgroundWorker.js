// @flow
import knex from '../data/knex';
import webPush from '../webPush';
import log from '../logger';
import root from '../compositionRoot';
import { EmailType } from './BackgroundService';
import type { PushMessages } from './NotificationService';

// https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e
export const promiseSerial = funcs =>
  funcs.reduce(
    (promise, func) =>
      promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([]),
  );

/*

function runSerial(tasks) {
  let result = Promise.resolve();
  tasks.forEach(task => {
    result = result.then(() => task());
  });
  return result;
}
*/

export const executeInBatches = (data, fn, batchSize = 5) => {
  if (!data.length) {
    return [];
  }
  const pushFns = [];
  const inputLength = data.length;

  for (let i = 0; i < inputLength; i += batchSize) {
    pushFns.push(() =>
      Promise.all(data.slice(i, i + batchSize).map(d => fn(d))),
    );
  }
  return promiseSerial(pushFns).catch(err => {
    log.error({ err });
  });
};

const createPushPromise = ({ subscriptionDetails, pushMessage, id }) => {
  if (subscriptionDetails) {
    const { message } = pushMessage;
    return webPush
      .sendNotification(
        {
          endpoint: subscriptionDetails.endpoint,
          keys: {
            auth: subscriptionDetails.auth,
            p256dh: subscriptionDetails.p256dh,
          },
        },
        JSON.stringify(message),
      )
      .then(response => {
        if (response.statusCode !== 201) {
          log.warn({
            pushService: {
              response,
              userId: id,
              subId: subscriptionDetails.id,
            },
          });
        } else {
          log.info(
            {
              pushService: { status: response.statusCode, userId: id },
            },
            'WebPush delivered!',
          );
        }
      })
      .catch(err => {
        const addInfo = { userId: id, subId: subscriptionDetails.id };
        const error = { err, ...addInfo };
        if (err.statusCode === 410 || err.statusCode === 404) {
          log.error(error, 'Subscription not found or gone');
          return knex('webpush_subscriptions')
            .where({ endpoint: subscriptionDetails.endpoint })
            .del()
            .then(() => {
              log.warn(addInfo, 'Deleted subscription!');
              // TODO notify user?
            })
            .catch(e =>
              log.error({ err: e, ...addInfo }, 'Subscription deletion failed'),
            );
        }
        log.error(error, 'Webpush failure');
        return Promise.resolve();
      });
  }

  return Promise.resolve();
};

const notifyMultiple = async (viewer, data: { messages: PushMessages }) => {
  // group by type&locale - get diff message by type , diff link
  const userIds = data.messages.reduce(
    (acc, curr) => acc.concat(curr.receiverIds),
    [],
  );

  const subscriptionData = await knex('webpush_subscriptions')
    .whereIn('user_id', userIds)
    .select();
  if (!subscriptionData.length) {
    return true;
  }

  const subData = [];

  data.messages.forEach(pushMessage => {
    pushMessage.receiverIds.forEach(rId => {
      const subscriptionDetails = subscriptionData.filter(
        // eslint-disable-next-line eqeqeq
        subscription => subscription.user_id === rId,
      );
      // each user can have multiple subscriptions!
      subscriptionDetails.forEach(details =>
        subData.push({
          subscriptionDetails: details,
          pushMessage,
          id: rId,
        }),
      );
    });
  });

  return executeInBatches(subData, createPushPromise, 1);
};

async function processMessages(message) {
  // log.info({ message }, 'Job received');
  let result = null;
  try {
    switch (message.type) {
      case 'batchPushing': {
        log.info('Starting webpush BATCH', message.data);
        result = notifyMultiple(message.viewer, message.data);

        break;
      }
      case 'mail': {
        log.info('Starting mail');
        const mailData = message.data;
        result = await root.BackgroundService.handleEmails(
          mailData.mailType,
          mailData,
        );
        break;
      }

      case 'batchMailing': {
        log.info('BATCHMAIL');
        result = await root.BackgroundService.handleEmails(
          EmailType.TEST_BATCH,
          message.data,
        );
        break;
      }

      case 'clean': {
        // clean up proposal_voters, etc
        throw Error('TO IMPLEMENT');
        // result = handleCleaning();
      }

      default:
        throw Error(`Job type not recognized: ${message.type}`);
    }
  } catch (err) {
    log.error({ err });
  }
  return result;
}
process.on('message', processMessages);
function onClosing(code, signal) {
  log.warn({ signal }, 'Worker closing');
  this.kill();
}
process.on('close', onClosing);
process.on('exit', onClosing);
