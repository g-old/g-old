// from https://github.com/GoogleChrome/samples/blob/gh-pages/push-messaging-and-notifications/service-worker.js
/* eslint-disable comma-dangle */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-globals */

self.addEventListener('push', event => {
  console.info('Received a push message', event.data.text());
  const info = JSON.parse(event.data.text());
  const title = info.title;
  const body = info.body;
  const icon = '/tile.png';
  const tag = info.tag;

  // prettier-ignore
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      tag,
      data: info.link,
    })
  );
});

self.addEventListener('notificationclick', event => {
  console.info('On notification click: ', event.notification.tags);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  let link = '/';
  if (event.notification.data) {
    link = event.notification.data;
  }
  // prettier-ignore
  event.waitUntil(
    /* eslint-disable */
    clients
      .matchAll({
        type: "window",
      })
      .then(clientList => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === link && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(link);
        }
      })
    /* eslint-enable */
  );
});
