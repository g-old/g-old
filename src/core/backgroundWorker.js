const knex = require('../data/knex');
const webPush = require('../webPush');

const notifyWebPushSubscribers = data =>
  knex('webpush_subscriptions')
    .select()
    .then(subs =>
      subs.map(s => ({
        endpoint: s.endpoint,
        keys: { auth: s.auth, p256dh: s.p256dh },
      })),
    )
    .then(allSubs =>
      allSubs.map(sub =>
        webPush
          .sendNotification(
            sub,
            JSON.stringify({
              body: data.title,
              link: `/proposal/${data.id}/${data.pollOne_id}`,
            }),
          )
          .catch(async (err) => {
            if (err.statusCode === 410) {
              console.error('Subscription should be deleted from DB: ', err);
              return knex('webpush_subscriptions').where({ endpoint: sub.endpoint }).del();
            }
            console.error('Subscription is no longer valid: ', err);
            return Promise.resolve();
          }),
      ),
    )
    .then(notifications => Promise.all(notifications));

const doWork = (jobId) => {
  knex('jobs').where({ id: jobId }).select().then((data) => {
    switch (data.type) {
      case 'webpush': {
        const proposal = JSON.parse(data.data);
        notifyWebPushSubscribers(proposal);
        break;
      }
      default:
        throw Error(`Job type not recognized: ${data.type}`);
    }
  });
};

module.exports = {
  doWork,
};
