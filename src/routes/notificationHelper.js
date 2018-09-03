import { updateNotification } from '../actions/notification';
import { getNotification } from '../reducers';

export default function updateNotifications(store, query) {
  const referrer = ['email', 'push', 'notification'];
  const state = store.getState();
  if (query && referrer.includes(query.ref)) {
    if (query.ref === 'notification' && query.refId) {
      // check if notification in store
      const notification = getNotification(state, query.refId);
      if (notification) {
        if (!notification.read) {
          store.dispatch(
            updateNotification({
              id: query.refId,
              read: true,
            }),
          );
        }
      } else {
        store.dispatch(
          updateNotification({
            id: query.refId,
            read: true,
          }),
        );
      }
      // do nothing
    } else {
      // email or push referrer
      store.dispatch(
        updateNotification({
          activityId: query.refId,
          read: true,
        }),
      );
    }
  }
}
