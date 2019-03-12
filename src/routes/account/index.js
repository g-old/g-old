import React from 'react';
import Layout from '../../components/Layout';
import { getSessionUser } from '../../reducers';
import { canAccess } from '../../organization';

const title = 'Account';

async function action({ store }) {
  const state = store.getState();

  const user = getSessionUser(state);

  if (user) {
    if (!canAccess(user, title)) {
      return { redirect: '/' };
    }
  } else {
    return { redirect: '/' };
  }
  return {
    chunks: ['account'],
    title,
    component: (
      <Layout>
        <h1>This is my account</h1>
      </Layout>
    ),
  };
}

export default action;
