import React from 'react';
import Layout from '../../components/Layout';
import { loadDiscussion } from '../../actions/discussion';
import DiscussionContainer from './DiscussionContainer';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'Discussion';

async function action({ store, path }, { id }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadDiscussion({ id }));
  } else {
    store.dispatch(loadDiscussion({ id }));
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
