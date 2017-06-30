import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import EmailVerification from './EmailVerification';

const title = 'Recover your Password';

export default {
  path: '/verify',

  async action({ store, path }) {
    const state = await store.getState();
    const user = getSessionUser(state);

    if (!user) {
      return { redirect: `/?redirect=${path}` };
    } else if (user.emailVerified) {
      return { redirect: '/' };
    }
    return {
      title,
      component: (
        <Layout>
          <EmailVerification user={user} />
          {' '}
        </Layout>
      ),
    };
  },
};
