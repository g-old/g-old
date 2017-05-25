import React from 'react';
import Layout from '../../components/Layout';
import { loadFeed } from '../../actions/feed';
import FeedContainer from './FeedContainer';
import { getSessionUser } from '../../reducers';

const title = 'Feed';

export default {
  path: '/feed',

  async action({ store }) {
    const user = getSessionUser(store.getState());
    if (!user || user.role.type === 'guest') {
      return { redirect: '/' };
    }
    if (!process.env.BROWSER) {
      await store.dispatch(loadFeed());
    } else {
      store.dispatch(loadFeed());
    }
    return {
      title,
      component: <Layout><FeedContainer /> </Layout>,
    };
  },
};
