import knex from '../data/knex';
import webPush from '../webPush';
import log from '../logger';
import VerifyEmail from '../data/models/VerifyEmail';
import { sendMail, emailVerificationMail, emailChangedMail } from './mailer';

const mailWithToken = async ({ address, viewer, connection, template }) => {
  const result = false;
  try {
    const token = await VerifyEmail.createToken({ email: address });

    const mail = template(address, connection, token, viewer.name);

    return sendMail(mail).then((info) => {
      // TODO ONLY for TESTING!
      console.info(info.envelope);
      console.info(info.messageId);
      console.info(info.message);
    });
  } catch (err) {
    log.error({ err }, 'Sending verification email failed');
  }
  return result;
};

const handleMails = (mailData) => {
  let result = null;
  switch (mailData.mailType) {
    case 'verifyEmail': {
      result = mailWithToken({ ...mailData, template: emailVerificationMail });
      break;
    }
    case 'mailChanged': {
      result = mailWithToken({ ...mailData, template: emailChangedMail });
      break;
    }
    default: {
      throw Error(`Mail type not recognized: ${mailData.mailType}`);
    }
  }
  return result;
};

const notifyProposalCreation = async (proposal) => {
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
        .then((response) => {
          log.info({ pushService: response });
          if (response.statusCode !== 201) {
            log.warn({ pushService: response });
          }
        })
        .catch((err) => {
          if (err.statusCode === 410) {
            log.error({ pushService: err }, 'Subscription should be deleted');
            return knex('webpush_subscriptions').where({ endpoint: sub.endpoint }).del();
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

process.on('message', async (data) => {
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

      default:
        throw Error(`Job type not recognized: ${data.type}`);
    }
  } catch (e) {
    log.error(e);
  }
  return result;
});

process.on('close', (code, signal) => {
  log.info({ signal }, 'Worker closing');
  this.kill();
});
process.on('exit', (code, signal) => {
  log.info({ signal }, 'Worker closing');
  this.kill();
});
