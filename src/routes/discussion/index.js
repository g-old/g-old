import React from 'react';
import Layout from '../../components/Layout';
import { loadDiscussion } from '../../actions/discussion';
import DiscussionContainer from './DiscussionContainer';
import { getSessionUser, getNotification } from '../../reducers';
import { canAccess } from '../../organization';
import { updateNotification } from '../../actions/notification';

const title = 'Discussion';

async function action({ store, path, query }, { id }) {
  const state = store.getState();
  const user = getSessionUser(state);
  if (!user) {
    let redirect = `/?redirect=${path}`;
    if (query.comment) {
      redirect += `&comment=${query.comment}`;
    }
    if (query.child) {
      redirect += `&child=${query.child}`;
    }
    if (query.ref) {
      redirect += `&ref=${query.ref}&refId=${query.refId}`;
    }
    return { redirect };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadDiscussion({ id, parentId: query.comment }));
  } else {
    await store.dispatch(loadDiscussion({ id, parentId: query.comment }));
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
    chunks: ['workteam'],
    title,
    component: (
      <Layout>
        <DiscussionContainer
          id={id}
          user={user}
          commentId={query.comment}
          childId={query.child}
        />
      </Layout>
    ),
  };
}
export default action;
