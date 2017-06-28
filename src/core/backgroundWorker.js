const env = process.env.NODE_ENV || 'development';
/* eslint-disable import/no-unresolved */
const config = require('../db/knexfile')[env];
const knex = require('knex')(config);
const webPush = require('./webPush');
const log = require('../logger');
/* eslint-disable import/no-unresolved */

/* eslint-disable comma-dangle */
const notifyWebPushSubscribers = data =>
  knex('webpush_subscriptions')
    .select()
    .then(subs =>
      subs.map(s => ({
        endpoint: s.endpoint,
        keys: { auth: s.auth, p256dh: s.p256dh }
      }))
    )
    .then(allSubs =>
      allSubs.map((sub) => {
        log.info({ sub }, 'Subscription details');
        return webPush
          .sendNotification(
            sub,
            JSON.stringify({
              body: data.title,
              link: `/proposal/${data.id}/${data.pollOne_id}`,
            })
          )
          .then((response) => {
            log.info({ pushService: response });
            if (response.statusCode !== 201) {
              log.warn({ pushService: response });
            }
          })
          .catch((err) => {
            if (err.statusCode === 410) {
              log.error(err, 'Subscription should be deleted');
              return knex('webpush_subscriptions').where({ endpoint: sub.endpoint }).del();
            }
            log.error(err, 'Subscription no longer valid');
            return Promise.resolve();
          });
      })
    )
    .then(notifications => Promise.all(notifications));

process.on('message', (data) => {
  log.info({ data }, 'Job received');
  let action = null;
  try {
    switch (data.type) {
      case 'webpush': {
        log.info('Starting webpush');

        action = notifyWebPushSubscribers(data.data);

        break;
      }

      default:
        throw Error(`Type not recognized: ${data.type}`);
    }
  } catch (e) {
    log.error(e);
  }
  return action;
});

process.on('close', (code, signal) => {
  log.info({ signal }, 'Worker closing');
});
