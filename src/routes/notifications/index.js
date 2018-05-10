import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import NotificationListContainer from './NotificationListContainer';
import { loadNotificationList } from '../../actions/notification';

const title = 'Notifications';

async function action({ store, path }) {
  const state = await store.getState();
  const user = getSessionUser(state);
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  }
  // Dont load in SSR
  if (process.env.BROWSER) {
    store.dispatch(
      // eslint-disable-next-line no-bitwise
      loadNotificationList({ first: 10, userId: user.id }),
    );
  }

  return {
    title,
    chunks: ['notifications'],
    component: (
      <Layout>
        <NotificationListContainer user={user} />
      </Layout>
    ),
  };
}
export default action;
