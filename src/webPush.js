const webPush = require('web-push');
const config = require('../private_configs');

webPush.setVapidDetails(
  `mailto:${config.webpush.mail}`,
  config.webpush.publicKey,
  config.webpush.privateKey,
);

// https://developers.google.com/web/fundamentals/engage-and-retain/push-notifications/subscribing-a-user

const registerSW = filepath =>
  navigator.serviceWorker
    .register(filepath)
    .then((registration) => {
      console.info('Service worker registered ');
      return registration;
    })
    .catch(err => console.error(`Unable to register Service worker: ${err}`));

const askPermission = () =>
  new Promise((resolve, reject) => {
    const permissionResult = Notification.requestPermission((result) => {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then((permissionResult) => {
    if (permissionResult !== 'granted') {
      throw new Error('Permission not granted');
    }
  });

// const subscribeUser = () => {};

module.exports = {
  webPush,
  publicKey: config.webpush.publicKey,
  askPermission,
  registerSW,
};
