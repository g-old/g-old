import knex from '../data/knex';
import webPush from '../webPush';
import log from '../logger';
import Proposal from '../data/models/Proposal';
import { circularFeedNotification } from './feed';
import createLoaders from '../data/dataLoader';
import root from '../compositionRoot';

const handleNotifications = async (viewer, notificationData, receiver) =>
  circularFeedNotification({
    viewer,
    data: notificationData,
    verb: 'create',
    receiver,
    loaders: createLoaders(),
  });

const push = async (subscriptionData, msg) => {
  let result;
  try {
    const subscriptions = subscriptionData.map(s => ({
      endpoint: s.endpoint,
      keys: { auth: s.auth, p256dh: s.p256dh },
    }));

    const notifications = subscriptions.map(sub =>
      webPush
        .sendNotification(
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

    result = await Promise.all(notifications);
  } catch (e) {
    log.error({ err: e }, 'Notification failed');
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
  const subscriptionData = await knex('webpush_subscriptions').select();
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

async function handleMessages(data) {
  log.info({ data }, 'Job received');
  let result = null;
  try {
    switch (data.type) {
      case 'webpush': {
        log.info('Starting webpush');

        result = notifyProposalCreation(data.data);

        break;
      }
      case 'webpushforstatementsTEST': {
        log.info('Starting webpush');
        result = notifyNewStatements(data.viewer, data.data, createLoaders());

        break;
      }
      case 'mail': {
        log.info('Starting mail');
        const mailData = data.data;
        result = await root.BackgroundService.handleEmails(
          mailData.mailType,
          mailData,
        );
        break;
      }

      case 'notification': {
        result = handleNotifications(
          data.data.viewer,
          data.data,
          data.data.receiver,
        );
        break;
      }

      case 'clean': {
        // clean up proposal_voters, etc
        throw Error('TO IMPLEMENT');
        // result = handleCleaning();
      }

      default:
        throw Error(`Job type not recognized: ${data.type}`);
    }
  } catch (e) {
    log.error(e);
  }
  return result;
}
process.on('message', handleMessages);
function onClosing(code, signal) {
  log.warn({ signal }, 'Worker closing');
  this.kill();
}
process.on('close', onClosing);
process.on('exit', onClosing);
