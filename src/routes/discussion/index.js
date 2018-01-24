import React from 'react';
import Layout from '../../components/Layout';
import { loadDiscussion } from '../../actions/discussion';
import DiscussionContainer from './DiscussionContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'Discussion';

async function action({ store, path, query: { comment, child } }, { id }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadDiscussion({ id, parentId: comment }));
  } else {
    await store.dispatch(loadDiscussion({ id, parentId: comment }));
  }
  return {
    chunks: ['workteam'],
    title,
    component: (
      <Layout>
        <DiscussionContainer
          id={id}
          user={user}
          commentId={comment}
          childId={child}
        />
      </Layout>
    ),
  };
}
export default action;
