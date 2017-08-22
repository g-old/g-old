import knex from '../data/knex';
import webPush from '../webPush';
import log from '../logger';
import { createToken } from './tokens';
import {
  sendMail,
  emailVerificationMail,
  emailChangedMail,
  resetLinkMail,
  resetSuccessMail,
  notificationMail,
} from './mailer';
import { circularFeedNotification } from './feed';

const mailWithToken = async ({
  address,
  viewer,
  connection,
  template,
  type,
}) => {
  const result = false;
  try {
    let token = null;
    switch (type) {
      case 'reset': {
        token = await createToken({
          email: address,
          table: 'reset_tokens',
          hoursValid: 2,
        });
        break;
      }
      case 'verify': {
        token = await createToken({
          email: address,
          table: 'verify_tokens',
          hoursValid: 48,
          withEmail: true,
        });
        break;
      }

      default: {
        throw Error(`Token type not recognized: ${type}`);
      }
    }
    const mail = template(address, connection, token, viewer.name);

    return sendMail(mail);
  } catch (err) {
    log.error({ err }, 'Sending token email failed');
  }
  return result;
};

const mailNotification = async mailData => {
  try {
    const { viewer, template, ...data } = mailData;
    const mail = template({ ...data, name: viewer.name });
    return sendMail(mail);
  } catch (err) {
    log.error({ err }, 'Sending email failed');
  }
  return null;
};

const handleNotifications = async (viewer, notificationData, receiver) => {
  switch (receiver.type) {
    case 'team': {
      return circularFeedNotification({
        viewer,
        data: notificationData,
        verb: 'create',
        receiver,
      });
    }

    default: {
      throw Error(
        `Notification type not recognized: ${notificationData.mailType}`,
      );
    }
  }
};

const handleMails = mailData => {
  let result = null;
  switch (mailData.mailType) {
    case 'verifyEmail': {
      result = mailWithToken({
        ...mailData,
        template: emailVerificationMail,
        type: 'verify',
      });
      break;
    }
    case 'mailChanged': {
      result = mailWithToken({
        ...mailData,
        template: emailChangedMail,
        type: 'verify',
      });
      break;
    }
    case 'resetPassword': {
      result = mailWithToken({
        ...mailData,
        template: resetLinkMail,
        type: 'reset',
      });
      break;
    }

    case 'resetSuccess': {
      result = mailNotification({ ...mailData, template: resetSuccessMail });
      break;
    }

    case 'notification': {
      result = mailNotification({ ...mailData, template: notificationMail });
      break;
    }
    default: {
      throw Error(`Mail type not recognized: ${mailData.mailType}`);
    }
  }
  return result;
};

const notifyProposalCreation = async proposal => {
  let result;
  try {
    const subscriptionData = await knex('webpush_subscriptions').select();

    const subscriptions = subscriptionData.map(s => ({
      endpoint: s.endpoint,
      keys: { auth: s.auth, p256dh: s.p256dh },
    }));

    const notifications = subscriptions.map(sub =>
      webPush
        .sendNotification(
          sub,
          JSON.stringify({
            body: proposal.title,
            link: `/proposal/${proposal.id}/${proposal.pollOne_id}`,
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

process.on('message', async data => {
  log.info({ data }, 'Job received');
  let result = null;
  try {
    switch (data.type) {
      case 'webpush': {
        log.info('Starting webpush');

        result = notifyProposalCreation(data.data);

        break;
      }
      case 'mail': {
        log.info('Starting mail');
        const mailData = data.data;
        result = handleMails(mailData);
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

      default:
        throw Error(`Job type not recognized: ${data.type}`);
    }
  } catch (e) {
    log.error(e);
  }
  return result;
});
function onClosing(code, signal) {
  log.warn({ signal }, 'Worker closing');
  this.kill();
}
process.on('close', onClosing);
process.on('exit', onClosing);
