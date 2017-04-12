import React from 'react';
import Layout from '../../components/Layout';
import UserProfile from '../../components/UserProfile';

const title = 'Reset your Password';

export default {
  path: '/account',

  async action({ store }) {
    // TODO check if token is valid and not expirated
    const user = store.getState().user;
    if (!user.id) {
      return { redirect: '/' };
    }
    return {
      title,
      component: <Layout><UserProfile user={user} /> </Layout>,
    };
  },
};
