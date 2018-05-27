import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser, getNotification } from '../../reducers';
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

  if (process.env.BROWSER) {
    const referrer = ['email', 'push', 'notification'];
    if (query && referrer.includes(query.ref)) {
      if (query.ref === 'notification' && query.id) {
        // check if notification in store
        const notification = getNotification(state, query.id);
        if (notification) {
          if (!notification.read) {
            store.dispatch(
              updateNotification({
                id: query.id,
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
