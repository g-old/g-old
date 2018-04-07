import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import NotificationListContainer from './NotificationListContainer';

const title = 'Notifications';

async function action({ store, path }) {
  const state = await store.getState();
  const user = getSessionUser(state);
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  }

  return {
    title,
    chunks: ['notifications'],
    component: (
      <Layout>
        <NotificationListContainer />
      </Layout>
    ),
  };
}
export default action;
