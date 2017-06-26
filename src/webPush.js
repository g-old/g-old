import webPush from 'web-push';
import config from '../private_configs';

webPush.setVapidDetails(
  `mailto:${config.webpush.mail}`,
  config.webpush.publicKey,
  config.webpush.privateKey,
);

// https://developers.google.com/web/fundamentals/engage-and-retain/push-notifications/subscribing-a-user

/* const askPermission = () =>
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
*/
// const subscribeUser = () => {};

export default webPush;
export const publicKey = config.webpush.publicKey;
