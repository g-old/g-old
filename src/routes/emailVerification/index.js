import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import EmailVerification from './EmailVerification';

const title = 'Recover your Password';

async function action({ store, path }) {
  const state = await store.getState();
  const user = getSessionUser(state);

  if (!user) {
    return { redirect: `/?redirect=${path}` };
  }
  if (user.emailVerified === true) {
    return { redirect: '/account' };
  }

  return {
    chunks: ['emailVerification'],
    title,
    component: (
      <Layout>
        <EmailVerification user={user} />{' '}
      </Layout>
    ),
  };
}

export default action;
