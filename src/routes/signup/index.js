import React from 'react';
import Layout from '../../components/Layout';
import SignupContainer from './SignupContainer';
import { getSessionUser } from '../../reducers';

const title = 'SignUp';

async function action({ store, locale }) {
  const user = getSessionUser(store.getState());
  /* if (user) {
    return { redirect: '/' };
  } */

  return {
    chunks: ['signup'],
    title,
    component: (
      <Layout>
        <SignupContainer locale={locale} user={user} />
      </Layout>
    ),
  };
}

export default action;
