// @flow
import knex from '../data/knex';
import webPush from '../webPush';
import log from '../logger';
import Proposal from '../data/models/Proposal';
import { circularFeedMessage } from './feed';
import createLoaders from '../data/dataLoader';
import root from '../compositionRoot';
import { EmailType } from './BackgroundService';
import type { PushMessages, PushData } from './NotificationService';

const handleMessages = async (viewer, messageData, receiver) =>
  circularFeedMessage({
    viewer,
    data: messageData,
    verb: 'create',
    receiver,
    loaders: createLoaders(),
  });

const push = async (subscriptionData, msg: PushData) => {
  let result;
  try {
    const subscriptions = [];
    subscriptionData.forEach(s => {
      if (s) {
        subscriptions.push({
          endpoint: s.endpoint,
          keys: { auth: s.auth, p256dh: s.p256dh },
        });
      }
    });

    const messages = subscriptions.map(sub =>
      webPush
        .sendNotification(sub, JSON.stringify(msg))
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
};

const notifyNewStatements = async (viewer, data, loaders) => {
  // check proposal
  const proposal = await Proposal.genByPoll(viewer, data.pollId, loaders);
  if (!proposal) return null;
  if (proposal.notifiedAt) {
    if (
      new Date(proposal.notifiedAt).getTime() >
      new Date().getTime() - 60 * 60 * 1000
    ) {
      return null;
    }
  }

  const subscriptionData = await knex
    .from('proposal_user_subscriptions')
    .where({ proposal_id: proposal.id })
    .innerJoin(
      'webpush_subscriptions',
      'proposal_user_subscriptions.user_id',
      'webpush_subscriptions.user_id',
    )
    .where('webpush_subscriptions.user_id', '!=', viewer.id)
    .select();

  const body =
    proposal.title.length > 40
      ? `${proposal.title.slice(0, 36)}...`
      : proposal.title;
  await push(subscriptionData, {
    body,
    link: `/proposal/${proposal.id}/${data.pollId}`,
    title: 'NEW Statements!',
    tag: 'statements',
  });

  const now = new Date();
  return knex('proposals')
    .where({ id: proposal.id })
    .update({ notified_at: now, updated_at: now });
};

const notifyProposalCreation = async proposal => {
  let subscriptionData;
  if (proposal.workTeamId) {
    subscriptionData = await knex('webpush_subscriptions')
      .innerJoin(
        'user_work_teams',
        'webpush_subscriptions.user_id',
        'user_work_teams.user_id',
      )
      .where('user_work_teams.work_team_id', '=', proposal.workTeamId)
      .select();
  } else {
    subscriptionData = await knex('webpush_subscriptions').select();
  }
  const body =
    proposal.title.length > 40
      ? `${proposal.title.slice(0, 36)}...`
      : proposal.title;
  const pollId = proposal.pollTwo_id
    ? proposal.pollTwo_id
    : proposal.pollOne_id;
  return push(subscriptionData, {
    body,
    link: `/proposal/${proposal.id}/${pollId}`,
    title: 'NEW Proposal!',
    tag: 'proposal',
  });
};
// https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e
const promiseSerial = funcs =>
  funcs.reduce(
    (promise, func) =>
      promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([]),
  );

const notifyMultiple = async (
  viewer,
  data: { messages: PushMessages, notificationIds: { [string]: ID } },
) => {
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

  const promises = data.messages.map(
    pushMessage =>
      pushMessage.receiverIds.map(id => {
        const subscriptionDetails = subscriptionData.find(
          // eslint-disable-next-line eqeqeq
          subscription => subscription.user_id === id,
        );
        if (subscriptionDetails) {
          const { message } = pushMessage;
          message.link +=
            data.notificationIds[`${pushMessage.activityId}$${id}`];
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
              log.info({ pushService: response });
              if (response.statusCode !== 201) {
                log.warn({ pushService: response });
              }
            })
            .catch(err => {
              if (err.statusCode === 410) {
                log.error(
                  { pushService: err },
                  'Subscription should be deleted',
                );
                return knex('webpush_subscriptions')
                  .where({ endpoint: subscriptionDetails.endpoint })
                  .del();
              }
              log.error(err, 'Subscription no longer valid');
              return Promise.resolve();
            });
        }

        return Promise.resolve();
      }),
    //  return push(subscriptions, pushMessage.message);
  );

  // execute promises in batches

  const promiseBatches = [];
  const end = promises.length;
  let counter = 0;
  for (let i = 0; i < end; i += 1) {
    if (i % 5) {
      promiseBatches.push(Promise.all(promises.slice(counter, 5)));
    }
    counter += 1;
  }
  promiseBatches.push(Promise.all(promises.slice(counter)));

  return promiseSerial(promiseBatches).catch(err => {
    log.error({ err });
  });
  // return Promise.all(promises);
};

async function processMessages(message) {
  log.info({ message }, 'Job received');
  let result = null;
  try {
    switch (message.type) {
      case 'webpush': {
        log.info('Starting webpush');

        result = notifyProposalCreation(message.data);

        break;
      }
      case 'webpushforstatementsTEST': {
        log.info('Starting webpush');
        result = notifyNewStatements(
          message.viewer,
          message.data,
          createLoaders(),
        );

        break;
      }
      case 'batchPushing': {
        log.info('Starting webpush BATCH');
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

      case 'message': {
        result = handleMessages(
          message.data.viewer,
          message.data,
          message.data.receiver,
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
  } catch (e) {
    log.error(e);
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
