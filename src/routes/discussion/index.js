import React from 'react';
import Layout from '../../components/Layout';
import { loadDiscussion } from '../../actions/discussion';
import { scrollToResource } from '../../actions/comment';
import updateNotificationStatus from '../notificationHelper';
import DiscussionContainer from './DiscussionContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';
import { createRedirectLink } from '../utils';

const title = 'Discussion';

async function action({ store, path, query }, { id }) {
  const state = store.getState();
  const user = getSessionUser(state);
  if (!user) {
    return { redirect: createRedirectLink(path, query) };
  }
  if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadDiscussion({ id, parentId: query.comment }));
  } else {
    store.dispatch(loadDiscussion({ id, parentId: query.comment }));
    if (query && (query.comment || query.child)) {
      store.dispatch(
        scrollToResource({
          id: query.comment,
          childId: query.child,
          containerId: id,
          type: 'comment',
        }),
      );
    }
    updateNotificationStatus(store, query);
  }

  return {
    chunks: ['workteam'],
    title,
    component: (
      <Layout>
        <DiscussionContainer id={id} user={user} />
      </Layout>
    ),
  };
}
export default action;
