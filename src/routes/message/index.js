import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser, getMessage, getNotification } from '../../reducers';
import { loadMessage } from '../../actions/message';
import { updateNotification } from '../../actions/notification';
import MessageContainer from './MessageContainer';

const title = 'Message';

async function action({ store, path, query }, { id }) {
  const state = store.getState();
  const user = getSessionUser(state);
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  }
  await store.dispatch(loadMessage(id));

  const message = getMessage(state, id);
  if (query && query.ref === 'notification') {
    // check if notification in store
    const notification = getNotification(state, query.id);
    if (notification && !notification.read) {
      await store.dispatch(updateNotification({ id: query.id, read: true }));
    }
    // ignore if not
  }
  return {
    title,
    chunks: ['message'],
    component: (
      <Layout>
        <MessageContainer {...message} />
      </Layout>
    ),
  };
}

export default action;
