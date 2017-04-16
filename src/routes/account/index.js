import React from 'react';
import Layout from '../../components/Layout';
import UserProfile from '../../components/UserProfile';

const title = 'User account';

export default {
  path: '/account',

  async action({ store }) {
    // TODO check if token is valid and not expirated
    const data = store.getState();
    const user = data.entities.users[data.user];
    if (!user.id) {
      return { redirect: '/' };
    }
    return {
      title,
      component: <Layout><UserProfile user={user} /> </Layout>,
    };
  },
};
