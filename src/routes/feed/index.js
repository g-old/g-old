import React from 'react';
import Layout from '../../components/Layout';
import { loadFeed } from '../../actions/posts';
import FeedContainer from './FeedContainer';
import { getSessionUser } from '../../reducers';
import { RESET_ACTIVITY_COUNTER } from '../../constants';
import { canAccess } from '../../organization';

const title = 'Feed';

async function action({ store, path }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (!canAccess(user, title)) {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadFeed());
    await store.dispatch({ type: RESET_ACTIVITY_COUNTER });
  } else {
    store.dispatch(loadFeed());
    store.dispatch({ type: RESET_ACTIVITY_COUNTER });
  }
  return {
    chunks: ['feed'],
    title,
    component: (
      <Layout>
        <FeedContainer />{' '}
      </Layout>
    ),
  };
}

export default action;
