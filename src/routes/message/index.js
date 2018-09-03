import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import updateNotificationStatus from '../notificationHelper';

import { loadMessage } from '../../actions/message';
import MessageContainer from './MessageContainer';
import { createRedirectLink } from '../utils';

const title = 'Message';

async function action({ store, path, query }, { id }) {
  const state = store.getState();
  const user = getSessionUser(state);
  if (!user) {
    return { redirect: createRedirectLink(path, query) };
  }
  await store.dispatch(loadMessage(id));

  updateNotificationStatus(store, query);

  return {
    title,
    chunks: ['message'],
    component: (
      <Layout>
        <MessageContainer id={id} />
      </Layout>
    ),
  };
}

export default action;
