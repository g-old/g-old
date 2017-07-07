import React from 'react';
import Layout from '../../components/Layout';
import { loadFeed } from '../../actions/feed';
import FeedContainer from './FeedContainer';
import { getSessionUser } from '../../reducers';

const title = 'Feed';

async function action({ store, path }) {
  const user = getSessionUser(store.getState());
  if (!user) {
    return { redirect: `/?redirect=${path}` };
  } else if (user.role.type === 'guest') {
    return { redirect: '/' };
  }
  if (!process.env.BROWSER) {
    await store.dispatch(loadFeed());
  } else {
    store.dispatch(loadFeed());
  }
  return {
    chunks: ['feed'],
    title,
    component: <Layout><FeedContainer /> </Layout>,
  };
}

export default action;
