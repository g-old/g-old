import React from 'react';
import Layout from '../../components/Layout';
import UserProfile from '../../components/UserProfile';
import { getSessionUser } from '../../reducers';

const title = 'User account';

export default {
  path: '/account',

  async action({ store, path }) {
    // TODO check if token is valid and not expirated
    const state = await store.getState();
    const user = getSessionUser(state);

    if (!user) {
      return { redirect: `/?redirect=${path}` };
    }
    return {
      title,
      component: (
        <Layout>
          <UserProfile user={user} />
        </Layout>
      ),
    };
  },
};
